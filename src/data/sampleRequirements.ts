/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectRequirements } from '../types';

export interface SampleDataset {
  id: string;
  name: string;
  badge: string;
  data: ProjectRequirements;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'user-login',
    name: 'User Login & Security Policy (Benchmark)',
    badge: 'Benchmark Target (REQ-001–005)',
    data: {
      project_name: 'Authentication & Session Management Service',
      system_assumptions: [
        'Passwords are stored as salted argon2id hashes.',
        'Users interact via HTTPS web browser interface.',
      ],
      requirements: [
        {
          id: 'REQ-001',
          title: 'Valid credential authentication',
          description: 'Registered users can log in with a valid email and password.',
          acceptance_criteria: [
            'Given a registered user with email and password, submitting valid credentials authenticates the user.',
            'A secure session cookie or bearer token is issued upon successful authentication.',
            'User is redirected to the dashboard.',
          ],
          is_unresolved: false,
          unresolved_note: null,
        },
        {
          id: 'REQ-002',
          title: 'Invalid credentials rejection',
          description: 'Invalid credentials must display an appropriate error.',
          acceptance_criteria: [
            'Submitting an incorrect password or unregistered email results in an error message.',
            "The error message must not disclose whether the email or password was incorrect ('Invalid email or password').",
            'HTTP 401 Unauthorized status is returned.',
          ],
          is_unresolved: false,
          unresolved_note: null,
        },
        {
          id: 'REQ-003',
          title: 'Email format validation',
          description: 'Email format must be validated.',
          acceptance_criteria: [
            'Input must conform to standard RFC 5322 email syntax.',
            'Invalid email structures (missing @, missing domain, spaces) trigger an inline validation error before submission.',
          ],
          is_unresolved: false,
          unresolved_note: null,
        },
        {
          id: 'REQ-004',
          title: 'Mandatory field enforcement',
          description: 'Required fields cannot be empty.',
          acceptance_criteria: [
            'Both email and password fields must contain non-whitespace characters.',
            'Submitting with empty or whitespace-only values prevents form submission and displays required field warnings.',
          ],
          is_unresolved: false,
          unresolved_note: null,
        },
        {
          id: 'REQ-005',
          title: 'Repeated failed login policy enforcement',
          description: 'Repeated failed login attempts must follow the application\'s configured security policy.',
          acceptance_criteria: [
            'Failed login attempts must be tracked per IP address and per user account.',
            'Enforce security policy once the failure threshold is reached.',
          ],
          is_unresolved: true,
          unresolved_note: 'CRITICAL SPECIFICATION GAP: The exact lockout threshold (e.g. 3 attempts vs 5 attempts) and mitigation action (CAPTCHA challenge vs 15-minute temporary lockout) are unconfigured. Test generators must flag this assumption rather than inventing arbitrary numbers.',
        },
      ],
    },
  },
  {
    id: 'shopping-checkout',
    name: 'Online Shopping Checkout',
    badge: 'E-Commerce Workflow',
    data: {
      project_name: 'Online Shopping Checkout Engine',
      system_assumptions: [
        'Inventory is reserved for 10 minutes upon entering payment step.',
        'Transactions are processed through a PCI-compliant payment gateway.',
      ],
      requirements: [
        {
          id: 'REQ-101',
          title: 'Inventory reservation',
          description: 'Adding items to active checkout temporarily holds warehouse inventory.',
          acceptance_criteria: [
            'Quantity requested must not exceed current in-stock count.',
            'Stock hold expires and releases back to available inventory if checkout is abandoned for > 10 minutes.',
          ],
          is_unresolved: false,
        },
        {
          id: 'REQ-102',
          title: 'Promotional discount validation',
          description: 'Promo codes must be validated for expiration, minimum cart value, and single-use constraints.',
          acceptance_criteria: [
            'Valid coupon discounts cart total accurately.',
            'Expired or duplicate coupons are rejected with a clear user notice.',
          ],
          is_unresolved: false,
        },
        {
          id: 'REQ-103',
          title: 'Payment gateway processing',
          description: 'Order is finalized only upon authorized payment capture.',
          acceptance_criteria: [
            'Declined cards abort checkout without charging customer.',
            'Successful authorization sends receipt email and triggers warehouse fulfillment.',
          ],
          is_unresolved: false,
        },
      ],
    },
  },
  {
    id: 'library-borrowing',
    name: 'Library Book Borrowing',
    badge: 'Circulation Rules',
    data: {
      project_name: 'Library Book Borrowing System',
      system_assumptions: ['Patrons must possess an active, non-suspended library membership.'],
      requirements: [
        {
          id: 'REQ-201',
          title: 'Borrowing item limit',
          description: 'A patron may borrow a maximum of 5 physical books concurrently.',
          acceptance_criteria: [
            "Attempting to check out a 6th item is blocked with 'Borrowing limit reached'.",
            'Returning a book immediately decrements active borrowed count.',
          ],
          is_unresolved: false,
        },
        {
          id: 'REQ-202',
          title: 'Overdue restriction',
          description: 'Patrons with items overdue by more than 14 days are barred from new checkouts.',
          acceptance_criteria: [
            'System flags patron account when overdue status occurs.',
            'Account clearance occurs once overdue items are returned and fees settled.',
          ],
          is_unresolved: false,
        },
      ],
    },
  },
  {
    id: 'leave-management',
    name: 'Employee Leave Management',
    badge: 'HR & Approvals',
    data: {
      project_name: 'Employee Leave Management System',
      system_assumptions: ['Working days exclude Saturdays, Sundays, and official company holidays.'],
      requirements: [
        {
          id: 'REQ-301',
          title: 'Leave balance deduction',
          description: 'Submitting paid time off reduces available leave balance by requested working days.',
          acceptance_criteria: [
            'Leave requests exceeding current accrued balance are rejected unless negative balance is approved.',
            'Weekends and statutory holidays within date range are not deducted.',
          ],
          is_unresolved: false,
        },
        {
          id: 'REQ-302',
          title: 'Manager approval workflow',
          description: 'Requests over 3 consecutive business days require supervisor sign-off.',
          acceptance_criteria: [
            "Status remains 'Pending Approval' until supervisor acts.",
            'Supervisor receives email notification with accept/reject action links.',
          ],
          is_unresolved: false,
        },
      ],
    },
  },
  {
    id: 'password-reset',
    name: 'Self-Service Password Reset',
    badge: 'Security & Token Lifecycle',
    data: {
      project_name: 'Self-Service Password Reset Service',
      system_assumptions: ['Reset links are delivered strictly to the verified email address on record.'],
      requirements: [
        {
          id: 'REQ-401',
          title: 'Reset link generation',
          description: 'Requesting a password reset generates a cryptographically secure, single-use token.',
          acceptance_criteria: [
            'Generic confirmation message displayed regardless of whether email exists (enumeration defense).',
            'Token is valid for exactly 15 minutes.',
          ],
          is_unresolved: false,
        },
        {
          id: 'REQ-402',
          title: 'Password reuse prohibition',
          description: 'New password cannot match the last 3 previously used passwords.',
          acceptance_criteria: [
            'System checks submitted password against hashed historical password table.',
            "Reusing recent password displays 'Password was recently used, choose a new one'.",
          ],
          is_unresolved: false,
        },
      ],
    },
  },
];
