/**
 * Blog Tools
 * Blog post management
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from '../types/index.js';

export function registerBlogTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_list_blogs',
      description: 'List all blog collections on the website',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const blogs = await client.getBlogs();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(blogs, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_blog',
      description: 'Get details of a specific blog',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
        },
        required: ['blogId'],
      },
      handler: async (args: { blogId: string }) => {
        const blog = await client.getBlog(args.blogId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(blog, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_list_blog_posts',
      description: 'List all blog posts in a blog with pagination',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
          cursor: {
            type: 'string',
            description: 'Pagination cursor',
          },
        },
        required: ['blogId'],
      },
      handler: async (args: { blogId: string; cursor?: string }) => {
        const posts = await client.getBlogPosts(args.blogId, { cursor: args.cursor });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(posts, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_blog_post',
      description: 'Get detailed information about a specific blog post',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
          postId: {
            type: 'string',
            description: 'The post ID',
          },
        },
        required: ['blogId', 'postId'],
      },
      handler: async (args: { blogId: string; postId: string }) => {
        const post = await client.getBlogPost(args.blogId, args.postId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(post, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_create_blog_post',
      description: 'Create a new blog post',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
          post: {
            type: 'object',
            description: 'Blog post details',
            properties: {
              title: { type: 'string' },
              body: { type: 'string', description: 'Post content (HTML supported)' },
              excerpt: { type: 'string' },
              author: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              categories: { type: 'array', items: { type: 'string' } },
              isPublished: { type: 'boolean', default: false },
              urlSlug: { type: 'string' },
            },
            required: ['title', 'body'],
          },
        },
        required: ['blogId', 'post'],
      },
      handler: async (args: { blogId: string; post: CreateBlogPostRequest }) => {
        const post = await client.createBlogPost(args.blogId, args.post);
        return {
          content: [
            {
              type: 'text',
              text: `Blog post created: ${post.title}\n${JSON.stringify(post, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_update_blog_post',
      description: 'Update an existing blog post',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
          postId: {
            type: 'string',
            description: 'The post ID',
          },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              body: { type: 'string' },
              excerpt: { type: 'string' },
              author: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              categories: { type: 'array', items: { type: 'string' } },
              isPublished: { type: 'boolean' },
              urlSlug: { type: 'string' },
              seoOptions: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  keywords: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        required: ['blogId', 'postId', 'updates'],
      },
      handler: async (args: { blogId: string; postId: string; updates: UpdateBlogPostRequest }) => {
        const post = await client.updateBlogPost(args.blogId, args.postId, args.updates);
        return {
          content: [
            {
              type: 'text',
              text: `Blog post updated: ${post.title}\n${JSON.stringify(post, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_delete_blog_post',
      description: 'Delete a blog post permanently',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
          postId: {
            type: 'string',
            description: 'The post ID',
          },
        },
        required: ['blogId', 'postId'],
      },
      handler: async (args: { blogId: string; postId: string }) => {
        await client.deleteBlogPost(args.blogId, args.postId);
        return {
          content: [
            {
              type: 'text',
              text: `Blog post ${args.postId} deleted successfully`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_publish_blog_post',
      description: 'Publish a draft blog post',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
          postId: {
            type: 'string',
            description: 'The post ID',
          },
        },
        required: ['blogId', 'postId'],
      },
      handler: async (args: { blogId: string; postId: string }) => {
        const post = await client.publishBlogPost(args.blogId, args.postId);
        return {
          content: [
            {
              type: 'text',
              text: `Blog post published: ${post.title}\n${JSON.stringify(post, null, 2)}`,
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_unpublish_blog_post',
      description: 'Unpublish a blog post (revert to draft)',
      inputSchema: {
        type: 'object',
        properties: {
          blogId: {
            type: 'string',
            description: 'The blog ID',
          },
          postId: {
            type: 'string',
            description: 'The post ID',
          },
        },
        required: ['blogId', 'postId'],
      },
      handler: async (args: { blogId: string; postId: string }) => {
        const post = await client.unpublishBlogPost(args.blogId, args.postId);
        return {
          content: [
            {
              type: 'text',
              text: `Blog post unpublished: ${post.title}\n${JSON.stringify(post, null, 2)}`,
            },
          ],
        };
      },
    },
  ];
}
