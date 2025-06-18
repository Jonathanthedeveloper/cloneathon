import { create } from 'zustand';
import { Id } from '../../convex/_generated/dataModel';


interface Attachment {
  id: string;
  file: File;
  storageId?: Id<"_storage">;
  uploading: boolean;
  error?: string;
}

interface ChatStore {
  message: string;
  modelId: string | null;
  anonymousMode: boolean;
  drivenIds: Set<string>;
  attachments: Attachment[];
  tools: string[];
  setMessage: (message: string) => void;
  setModelId: (modelId: string | null) => void;
  isDriven: (messageId: string) => boolean;
  addToDrivenIds: (messageId: string) => void;
  toggleAnonymousMode: () => void;
  canSendMessage: () => boolean;
  setAttachments: (attachments: Attachment[] | ((prev: Attachment[]) => Attachment[])) => void;
  clearAttachments: () => void;
  setTools: (tools: string[] | ((prev: string[]) => string[])) => void
}

const DRIVEN_IDS_KEY = "t3chat_drivenIds";

function loadDrivenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DRIVEN_IDS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveDrivenIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRIVEN_IDS_KEY, JSON.stringify(Array.from(ids)));
}

export const useChatStore = create<ChatStore>((set, get) => ({
  message: '',
  modelId: null as string | null,
  anonymousMode: false,
  drivenIds: loadDrivenIds(),
  attachments: [],
  tools: [],

  setMessage: (message: string) => set({ message }),
  setModelId: (modelId: string | null) => set({ modelId }),
  toggleAnonymousMode: () => set((state) => ({ anonymousMode: !state.anonymousMode })),
  canSendMessage: () => {
    const { message, modelId, attachments } = get();
    const hasUploadingFiles = attachments.some(f => f.uploading);
    return message.trim().length > 0 && modelId !== null && !hasUploadingFiles;
  },
  isDriven: (messageId: string) => get().drivenIds.has(messageId),
  addToDrivenIds: (messageId: string) => set((state) => {
    const newDrivenIds = new Set(state.drivenIds);
    newDrivenIds.add(messageId);
    saveDrivenIds(newDrivenIds);
    return { drivenIds: newDrivenIds };
  }),
  setAttachments: (attachments) => set((state) => ({
    attachments: typeof attachments === 'function' ? attachments(state.attachments) : attachments
  })),
  clearAttachments: () => set({ attachments: [] }),
  setTools: (tools) => set((state) => ({
    tools: typeof tools === "function" ? tools(state.tools) : tools
  }))
}));

// On app load, rehydrate drivenIds from localStorage if needed
if (typeof window !== "undefined") {
  const ids = loadDrivenIds();
  useChatStore.setState({ drivenIds: ids });
}

