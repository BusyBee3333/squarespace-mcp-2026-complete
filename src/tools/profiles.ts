/**
 * Profiles Tools
 * Customer, subscriber, and donor management
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { Profile, ProfilesQueryParams } from '../types/index.js';

export function registerProfilesTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_list_profiles',
      description: 'List all profiles (customers, subscribers, donors) with pagination',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Filter by email address',
          },
          modifiedAfter: {
            type: 'string',
            description: 'ISO 8601 date to filter profiles modified after',
          },
          modifiedBefore: {
            type: 'string',
            description: 'ISO 8601 date to filter profiles modified before',
          },
          cursor: {
            type: 'string',
            description: 'Pagination cursor',
          },
        },
      },
      handler: async (args: ProfilesQueryParams) => {
        const profiles = await client.getProfiles(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(profiles, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_profile',
      description: 'Get detailed information about a specific profile',
      inputSchema: {
        type: 'object',
        properties: {
          profileId: {
            type: 'string',
            description: 'The profile ID',
          },
        },
        required: ['profileId'],
      },
      handler: async (args: { profileId: string }) => {
        const profile = await client.getProfile(args.profileId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(profile, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_list_customers',
      description: 'List all customers (profiles with purchases)',
      inputSchema: {
        type: 'object',
        properties: {
          cursor: {
            type: 'string',
            description: 'Pagination cursor',
          },
        },
      },
      handler: async (args: { cursor?: string }) => {
        const customers = await client.getCustomers(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customers, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_list_subscribers',
      description: 'List all mailing list subscribers',
      inputSchema: {
        type: 'object',
        properties: {
          cursor: {
            type: 'string',
            description: 'Pagination cursor',
          },
        },
      },
      handler: async (args: { cursor?: string }) => {
        const subscribers = await client.getSubscribers(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(subscribers, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_list_donors',
      description: 'List all donors',
      inputSchema: {
        type: 'object',
        properties: {
          cursor: {
            type: 'string',
            description: 'Pagination cursor',
          },
        },
      },
      handler: async (args: { cursor?: string }) => {
        const donors = await client.getDonors(args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(donors, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_search_profiles_by_email',
      description: 'Search for profiles by email address',
      inputSchema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Email to search for',
          },
        },
        required: ['email'],
      },
      handler: async (args: { email: string }) => {
        const profiles = await client.getProfiles({ email: args.email });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(profiles, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_top_customers',
      description: 'Get top customers by lifetime value',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of top customers to return (default: 10)',
            default: 10,
          },
        },
      },
      handler: async (args: { limit?: number }) => {
        const limit = args.limit || 10;
        const customers = await client.getCustomers();
        
        const sorted = customers.result
          .filter(p => p.customerDetails)
          .sort((a, b) => {
            const aVal = parseFloat(a.customerDetails!.totalRevenue.value);
            const bVal = parseFloat(b.customerDetails!.totalRevenue.value);
            return bVal - aVal;
          })
          .slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: `Top ${limit} customers by lifetime value:\n${JSON.stringify(sorted, null, 2)}`,
            },
          ],
        };
      },
    },
  ];
}
