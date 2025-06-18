import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";


export const upvote = mutation({
    args: { feature: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("User must be authenticated to vote");
        }

        const vote = await ctx.db.query("featureVotes").filter(q => q.eq(q.field("userId"), userId)).filter(q => q.eq(q.field("feature"), args.feature)).first();

        if (vote) {
            await ctx.db.patch(vote._id, {
                vote: 1
            });
        } else {
            await ctx.db.insert("featureVotes", {
                userId,
                feature: args.feature,
                vote: 1
            });
        }

        return { success: true };
    }
});

export const downvote = mutation({
    args: { feature: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("User must be authenticated to vote");
        }

        const vote = await ctx.db.query("featureVotes").filter(q => q.eq(q.field("userId"), userId)).filter(q => q.eq(q.field("feature"), args.feature)).first();

        if (vote) {
            await ctx.db.patch(vote._id, {
                vote: -1
            });
        } else {
            await ctx.db.insert("featureVotes", {
                userId,
                feature: args.feature,
                vote: -1
            });
        }

        return { success: true };
    }
});


export const getVotes = query({
    args: { feature: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const userVote = await ctx.db.query("featureVotes").filter(q => q.eq(q.field("userId"), userId)).filter(q => q.eq(q.field("feature"), args.feature)).first();


        const votes = await ctx.db.query("featureVotes").filter(q => q.eq(q.field("feature"), args.feature)).collect();

        const upvotes = votes.filter(vote => vote.vote === 1).length;
        const downvotes = votes.filter(vote => vote.vote === -1).length;

        return {
            user: {
                vote: userVote ? userVote.vote : 0,
                notify: userVote ? userVote.notify : false
            },
            vote: {
                upvotes,
                downvotes
            }
        };
     }
})


export const toggleSubscription = mutation({
    args: { feature: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("User must be authenticated to toggle subscription");
        }

        const vote = await ctx.db.query("featureVotes").filter(q => q.eq(q.field("userId"), userId)).filter(q => q.eq(q.field("feature"), args.feature)).first();

        if (vote) {
            await ctx.db.patch(vote._id, {
                notify: !vote.notify
            });
        } else {
            await ctx.db.insert("featureVotes", {
                userId,
                feature: args.feature,
                vote: 0,
                notify: true
            });
        }
      

        return { success: true };
    }
});