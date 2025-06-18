/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { MicIcon, MicOffIcon } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const win = window as any;
    const SpeechRecognition = (win.SpeechRecognition || win.webkitSpeechRecognition) as any;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, [onTranscript]);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant={listening ? "secondary" : "outline"}
      onClick={handleMicClick}
      aria-label={listening ? "Stop recording" : "Start recording"}
      className={listening ? "ring-2 ring-red-500 animate-pulse" : ""}
    >
      {listening ? <MicOffIcon className="text-red-500" /> : <MicIcon />}
    </Button>
  );
} 