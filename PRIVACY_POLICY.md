# Privacy Policy and Data Protection Compliance

## AI-Enabled Inventory Forecasting System

**Effective Date:** January 9, 2026  
**Institution:** Dedan Kimathi University of Technology  
**Project:** Final Year BSc Information Technology

---

## 1. Introduction

This Privacy Policy outlines how the AI-Enabled Inventory Forecasting System ("the System") collects, uses, stores, and protects personal and business data in compliance with the **Kenya Data Protection Act, 2019** and international data protection best practices.

## 2. Legal Framework

This system complies with:
- **Kenya Data Protection Act, 2019**
- **Office of the Data Protection Commissioner (ODPC) Guidelines**
- **General Data Protection Regulation (GDPR) Principles** (where applicable)

## 3. Data Controller Information

**Data Controller:** [Business Name/Institution]  
**Contact Person:** System Administrator  
**Email:** [admin@business.com]  
**Physical Address:** [Business Address]  
**DPO (if applicable):** [Data Protection Officer Name]

## 4. Types of Data Collected

### 4.1 Personal Data
- **User Information:**
  - Full name
  - Email address
  - Phone number (for WhatsApp notifications)
  - User role (SuperAdmin, Admin, Manager, Staff)
  - Password (encrypted using bcrypt)
  - Login timestamps and IP addresses

### 4.2 Business Data
- **Product Information:**
  - Product names, categories, SKUs
  - Pricing information (cost, selling price)
  - Stock quantities and locations
  - Expiry dates
  - Supplier information

- **Transaction Data:**
  - Sales records (date, quantity, amount)
  - Purchase orders
  - Inventory movements
  - Payment methods (Cash, M-Pesa)

- **Activity Logs:**
  - User actions and timestamps
  - System access logs
  - Shift start/end times

### 4.3 System-Generated Data
- Forecasting predictions
- Alert notifications
- Risk assessment scores
- Analytics and reports

## 5. Purpose of Data Collection

Data is collected and processed for the following purposes:

1. **Inventory Management:** Track stock levels, movements, and locations
2. **Sales Processing:** Record transactions and generate receipts
3. **Forecasting:** Predict future demand using AI/ML algorithms
4. **Alert Generation:** Notify users of low stock, expiring products, aging inventory
5. **User Authentication:** Secure access control and role-based permissions
6. **Audit Trails:** Maintain activity logs for compliance and security
7. **Business Analytics:** Generate reports and insights for decision-making
8. **Communication:** Send WhatsApp notifications for critical alerts

## 6. Legal Basis for Processing

Data processing is based on:

- **Consent:** Users explicitly consent during registration and system use
- **Contract Performance:** Processing necessary for business operations
- **Legitimate Interest:** Fraud prevention, system security, business optimization
- **Legal Obligation:** Record-keeping for tax and regulatory compliance

## 7. Data Collection Methods

### 7.1 Direct Collection
- User registration forms
- Product entry interfaces
- Sales transaction inputs
- Manual data entry by authorized personnel

### 7.2 Automatic Collection
- Login activity tracking
- System usage analytics
- Forecasting model predictions
- Alert generation

## 8. Data Security Measures

### 8.1 Technical Safeguards
- **Encryption:**
  - Passwords hashed using bcrypt (10 salt rounds)
  - JWT tokens for session management
  - HTTPS/TLS for data transmission (production)
  
- **Access Control:**
  - Role-based permissions (SuperAdmin, Admin, Manager, Staff)
  - Authentication middleware on all protected routes
  - Session timeout after inactivity

- **Database Security:**
  - PostgreSQL with Prisma ORM (parameterized queries prevent SQL injection)
  - Regular backups
  - Access restricted to authorized personnel

- **Network Security:**
  - CORS configuration limiting frontend origins
  - Input validation and sanitization
  - Rate limiting on API endpoints

### 8.2 Organizational Measures
- **Access Management:**
  - Principle of least privilege
  - Regular access reviews
  - Immediate revocation of access for departed staff

- **Training:**
  - User training on data handling procedures
  - Security awareness for all staff

- **Incident Response:**
  - Data breach notification procedures
  - Incident logging and investigation

## 9. Data Retention

### 9.1 Retention Periods
- **User Accounts:** Retained while active; deleted 30 days after account closure
- **Transaction Data:** Retained for 7 years (tax compliance)
- **Activity Logs:** Retained for 12 months
- **Forecasting Data:** Retained for 24 months
- **Expired Product Records:** Retained for 3 years

### 9.2 Deletion Procedures
- Soft delete with anonymization option
- Hard delete after retention period expires
- Secure data destruction (overwriting, not just marking as deleted)

## 10. Data Sharing and Third Parties

### 10.1 Third-Party Services
- **Twilio (WhatsApp API):**
  - Purpose: Send alert notifications
  - Data Shared: Phone numbers, alert messages
  - Privacy Policy: https://www.twilio.com/legal/privacy

### 10.2 No Sale of Data
We **DO NOT** sell, rent, or trade personal or business data to third parties for marketing purposes.

### 10.3 Data Sharing for Legal Purposes
Data may be shared with:
- Law enforcement (with valid warrant/court order)
- Tax authorities (KRA compliance)
- Regulatory bodies (ODPC audits)

## 11. User Rights (Kenya Data Protection Act)

Users have the following rights:

### 11.1 Right to Access
Request a copy of all personal data held by the system.

### 11.2 Right to Rectification
Correct inaccurate or incomplete data through profile settings.

### 11.3 Right to Erasure ("Right to be Forgotten")
Request deletion of personal data (subject to legal retention requirements).

### 11.4 Right to Restrict Processing
Limit how personal data is used.

### 11.5 Right to Data Portability
Receive personal data in a structured, machine-readable format (JSON/CSV export).

### 11.6 Right to Object
Object to processing for specific purposes (e.g., marketing communications).

### 11.7 Right to Withdraw Consent
Withdraw consent at any time (does not affect prior processing).

### 11.8 Right to Lodge a Complaint
File a complaint with the Office of the Data Protection Commissioner (ODPC).

**ODPC Contact:**
- Website: https://www.odpc.go.ke
- Email: info@odpc.go.ke
- Phone: +254 (020) 2889000

## 12. Data Subject Requests

To exercise your rights:

1. **Email:** Send request to [dpo@business.com]
2. **In-Person:** Visit [Business Address]
3. **Response Time:** Within 30 days
4. **Verification:** Identity verification required for security

## 13. Cookies and Tracking

### 13.1 Essential Cookies
- Session management (JWT tokens in localStorage)
- User authentication state

### 13.2 Analytics
- No third-party analytics currently implemented
- Future: Google Analytics (with consent)

## 14. Data Breach Notification

In the event of a data breach:

1. **Notification to ODPC:** Within 72 hours
2. **Notification to Users:** Without undue delay if high risk
3. **Remediation:** Immediate action to contain and mitigate

## 15. Children's Privacy

This system is not intended for users under 18 years of age. We do not knowingly collect data from minors.

## 16. International Data Transfers

Currently, all data is stored within Kenya (local PostgreSQL database). If international transfers occur:
- Adequate safeguards will be implemented
- User consent will be obtained
- ODPC notification as required

## 17. Automated Decision-Making

### 17.1 AI Forecasting
- **Purpose:** Predict product demand
- **Impact:** Informs restocking decisions
- **Human Oversight:** Managers review and approve orders
- **Right to Object:** Users can request manual review

### 17.2 Alert Generation
- **Purpose:** Notify of low stock, expiry, aging inventory
- **Logic:** Rule-based thresholds (not profiling)
- **Human Oversight:** Staff can dismiss or investigate alerts

## 18. Data Anonymization

When anonymization is requested or required:
- Personal identifiers removed (name, email, phone)
- User IDs replaced with pseudonyms
- Transaction data aggregated
- Irreversible anonymization techniques

## 19. Updates to Privacy Policy

This policy may be updated to reflect:
- Changes in legislation
- System enhancements
- Best practice evolution

**Users will be notified via:**
- Email notification
- In-app banner
- 30 days' notice before changes take effect

## 20. Consent

### 20.1 Registration Consent
By registering for the system, you consent to:
- Collection and processing of personal data as described
- Use of email and phone for system communications
- Storage of activity logs for audit purposes

### 20.2 WhatsApp Notification Consent
Users can opt-in/opt-out of WhatsApp alerts in profile settings.

### 20.3 Withdrawal of Consent
Email [dpo@business.com] to withdraw consent. Account functionality may be limited.

## 21. Contact Information

For privacy-related inquiries:

**Data Protection Officer:**  
Email: [dpo@business.com]  
Phone: [+254XXXXXXXXX]  
Address: [Business Address]

**System Administrator:**  
Email: [admin@business.com]

---

## Appendix A: User Consent Form Template

```
USER CONSENT FORM
AI-Enabled Inventory Forecasting System

I, [User Name], hereby consent to:

1. Collection and processing of my personal data (name, email, phone) for system access
2. Storage of my activity logs for security and audit purposes
3. Receipt of system notifications via email
4. [Optional] Receipt of WhatsApp alerts for low stock, expiry, and critical updates
5. Use of my sales data for AI forecasting and analytics

I understand that:
- My data will be protected in accordance with the Kenya Data Protection Act, 2019
- I have the right to access, rectify, or delete my data
- I can withdraw consent at any time
- My data will not be sold to third parties

Signature: ________________  
Date: ________________  
User ID: ________________
```

---

## Appendix B: Data Processing Register

| Processing Activity | Data Type | Purpose | Legal Basis | Retention Period |
|---------------------|-----------|---------|-------------|------------------|
| User Authentication | Name, Email, Password | Access Control | Contract | Active + 30 days |
| Sales Recording | Transaction Data | Business Operations | Contract | 7 years |
| Forecasting | Historical Sales | Demand Prediction | Legitimate Interest | 24 months |
| WhatsApp Alerts | Phone Number, Product Info | Notifications | Consent | 12 months |
| Activity Logging | User Actions, Timestamps | Audit Trail | Legal Obligation | 12 months |

---

**Last Updated:** January 9, 2026  
**Version:** 1.0  
**Next Review:** July 9, 2026
