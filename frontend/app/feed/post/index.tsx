'use client'
import axios from "axios";
import { useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { List, useDynamicRowHeight, type RowComponentProps } from "react-window";
import { useInView } from "react-intersection-observer";
import PostCard from "./PostCard";
import SkeletonPost from "./SkeletonPost";
import type { Post, Author } from "./types";

const PAGE_SIZE = 10;
const ESTIMATED_ITEM_HEIGHT = 500;

import FeedHeader from "../FeedHeader";

const Row = memo(({ index, style, ariaAttributes, posts, userData, handlePostUpdated, loadMoreRef }: any) => {
    if (index === 0) {
        return (
            <div style={style} {...ariaAttributes}>
                <FeedHeader />
            </div>
        );
    }

    const postIndex = index - 1;
    const post = posts[postIndex];
    if (!post) return null;

    return (
        <div style={style} {...ariaAttributes}>
            <div style={{ paddingBottom: 16 }}>
                <PostCard
                    post={post}
                    currentUser={userData}
                    onPostUpdated={handlePostUpdated}
                />
                {index === posts.length && (
                    <div ref={loadMoreRef} style={{ height: 20 }} />
                )}
            </div>
        </div>
    );
});

Row.displayName = 'PostRow';

export default function PostList() {
    const queryClient = useQueryClient();
    const { ref: loadMoreRef, inView } = useInView();

    // Fetch current user with React Query
    const { data: userData } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const res = await axios.get("/api/post/me");
            return res.data.user as Author;
        }
    });

    // Fetch posts with Infinite Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['posts'],
        queryFn: async ({ pageParam = null }) => {
            const res = await axios.get("/api/post", {
                params: {
                    cursor: pageParam,
                    limit: PAGE_SIZE,
                },
            });
            return res.data;
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const posts = useMemo(() => data?.pages.flatMap((page) => page.posts) ?? [], [data]);

    // Trigger load more when the last element is in view
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Handle post updates in the query cache
    const handlePostUpdated = useCallback((updatedPost: Post) => {
        queryClient.setQueryData(['posts'], (oldData: any) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                    ...page,
                    posts: page.posts.map((p: Post) => 
                        p.id === updatedPost.id ? updatedPost : p
                    ),
                })),
            };
        });
    }, [queryClient]);

    // react-window 2.x uses useDynamicRowHeight for variable heights
    const dynamicRowHeight = useDynamicRowHeight({ 
        defaultRowHeight: ESTIMATED_ITEM_HEIGHT 
    });

    const rowProps = useMemo(() => ({
        posts,
        userData,
        handlePostUpdated,
        loadMoreRef
    }), [posts, userData, handlePostUpdated, loadMoreRef]);

    if (status === 'pending') {
        return (
            <>
                <SkeletonPost />
                <SkeletonPost />
                <SkeletonPost />
            </>
        );
    }

    if (status === 'error') {
        return (
            <div style={{ textAlign: "center", padding: "40px 0", color: "red" }}>
                Failed to load posts.
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
                <FeedHeader />
                <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                    No posts yet. Be the first to share something!
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: 'calc(100vh - 100px)', width: '100%', overflow: 'hidden', position: 'relative' }}>
            <List
                rowCount={posts.length + 1}
                rowHeight={dynamicRowHeight}
                rowComponent={Row}
                style={{ height: '100%', width: '100%' }}
                rowProps={rowProps}
            />
            {isFetchingNextPage && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: '#fff' }}>
                    <SkeletonPost />
                </div>
            )}
        </div>
    );
}