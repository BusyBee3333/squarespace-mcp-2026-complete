/**
 * Forms Tools
 * Form and form submission management
 */

import { SquarespaceClient } from '../clients/squarespace.js';
import type { Form, FormSubmission, FormSubmissionsQueryParams } from '../types/index.js';

export function registerFormsTools(client: SquarespaceClient) {
  return [
    {
      name: 'squarespace_list_forms',
      description: 'List all forms on the website',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const forms = await client.getForms();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(forms, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_form',
      description: 'Get details of a specific form including all fields',
      inputSchema: {
        type: 'object',
        properties: {
          formId: {
            type: 'string',
            description: 'The form ID',
          },
        },
        required: ['formId'],
      },
      handler: async (args: { formId: string }) => {
        const form = await client.getForm(args.formId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(form, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_list_form_submissions',
      description: 'List form submissions with optional filtering and pagination',
      inputSchema: {
        type: 'object',
        properties: {
          formId: {
            type: 'string',
            description: 'Filter by specific form ID (optional)',
          },
          submittedAfter: {
            type: 'string',
            description: 'ISO 8601 date to filter submissions after',
          },
          submittedBefore: {
            type: 'string',
            description: 'ISO 8601 date to filter submissions before',
          },
          cursor: {
            type: 'string',
            description: 'Pagination cursor',
          },
        },
      },
      handler: async (args: { formId?: string } & FormSubmissionsQueryParams) => {
        const { formId, ...params } = args;
        const submissions = await client.getFormSubmissions(formId, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(submissions, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_get_form_submission',
      description: 'Get detailed information about a specific form submission',
      inputSchema: {
        type: 'object',
        properties: {
          submissionId: {
            type: 'string',
            description: 'The submission ID',
          },
        },
        required: ['submissionId'],
      },
      handler: async (args: { submissionId: string }) => {
        const submission = await client.getFormSubmission(args.submissionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(submission, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'squarespace_export_form_submissions',
      description: 'Export all submissions for a form as CSV-formatted text',
      inputSchema: {
        type: 'object',
        properties: {
          formId: {
            type: 'string',
            description: 'The form ID',
          },
        },
        required: ['formId'],
      },
      handler: async (args: { formId: string }) => {
        const submissions = await client.getFormSubmissions(args.formId);
        
        if (submissions.result.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No submissions found for this form',
              },
            ],
          };
        }

        // Build CSV headers from first submission
        const firstSub = submissions.result[0];
        const headers = ['Submission ID', 'Submitted On', ...firstSub.responses.map(r => r.fieldId)];
        
        // Build CSV rows
        const rows = submissions.result.map(sub => [
          sub.id,
          sub.submittedOn,
          ...sub.responses.map(r => `"${r.value.replace(/"/g, '""')}"`)
        ]);

        const csv = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');

        return {
          content: [
            {
              type: 'text',
              text: csv,
            },
          ],
        };
      },
    },
  ];
}
