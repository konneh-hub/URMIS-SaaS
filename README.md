# University Result Management Information System (URMIS)

A modern, cloud-based, multi-tenant SaaS platform for managing academic results in universities, colleges, polytechnics, and other educational institutions.

## Product Requirements Document (PRD)

**Version:** 1.0

---

## 1. Introduction

### 1.1 Background
Higher education institutions manage large amounts of academic data, including students, courses, examinations, grades, and academic performance records. Many institutions still rely on manual processes, spreadsheets, or disconnected systems for result management. These methods are time-consuming, difficult to maintain, and often introduce errors during result calculation, verification, and publication.

The University Result Management Information System (URMIS) is a modern, cloud-based SaaS platform designed to simplify and automate academic result management for universities and other educational institutions.

URMIS is built as a multi-tenant platform, allowing multiple institutions to use the same system while keeping their data completely separate and secure.

Each institution will have its own:

- Administrators
- Staff users
- Students
- Faculties
- Departments
- Courses
- Academic sessions
- Results

No institution will be able to access another institution's information.

---

## 2. Product Vision
The vision of URMIS is to provide a reliable, secure, and scalable academic management platform that enables institutions to efficiently manage student results, improve transparency, reduce manual errors, and support better academic decision-making.

The system focuses on:

- Digital result processing
- Automated grade calculation
- GPA and CGPA computation
- Secure approval workflows
- Academic reporting
- Institutional performance analysis

In the future, URMIS can expand into a complete Student Information System (SIS) supporting admissions, finance, attendance, library, and learning management.

---

## 3. Business Model (SaaS Platform)
URMIS operates as a Software-as-a-Service platform, where institutions subscribe to use the system instead of installing separate software.

The platform owner manages one central system where multiple institutions operate independently.

### Target Customers

- Universities
- Colleges
- Polytechnics
- Technical institutes
- Private educational institutions
- Online education providers

---

## 4. Technology Stack
URMIS will use modern web technologies to support scalability, security, and maintainability.

### Frontend
URMIS uses Next.js as the main application framework because it provides:

- High performance
- Server-side rendering
- Secure backend integration
- Scalable application structure

Additional frontend technologies include:

- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form
- Zod validation
- Recharts for analytics dashboards

### Backend
The system will use Next.js server-side features such as:

- Server Actions
- Route Handlers
- API endpoints
- Business logic services

For complex future services, separate backend services can be introduced.

### Database
#### PostgreSQL
PostgreSQL will be the main production database because it supports:

- Large amounts of data
- Strong security
- Complex relationships
- Multi-tenant applications

#### ORM
Prisma ORM will be used for:

- Database communication
- Schema management
- Secure queries
- Database migrations

### Authentication and Security
The system will use:

- Auth.js authentication
- JWT-based sessions
- Password encryption
- Role-Based Access Control (RBAC)
- Permission management
- Tenant data isolation

### Deployment
Recommended deployment options:

- Frontend/Application: Vercel
- Database: PostgreSQL (Supabase, Neon, Railway, or Render)
- File Storage: AWS S3 or Cloudinary

---

## 5. System Architecture
URMIS follows a multi-layer architecture.

```text
Users
  │
  ▼
Next.js Application
  │
  ▼
Authentication & Authorization
  │
  ▼
Business Logic
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL Database
```

Every institution-owned record contains an institution identifier to ensure data isolation.

Example:

```text
Student Table
ID | Name | Institution
1  | John | University A
2  | Mary | University B
```

University A cannot access Mary's record.

---

## 6. User Roles and Permissions
URMIS uses Role-Based Access Control. Each user can only perform actions allowed by their role.

### 6.1 System Administrator
The System Administrator manages the entire URMIS platform.

#### Responsibilities
- Create institutions
- Manage subscriptions
- Monitor system activities
- Manage platform settings
- View overall analytics

#### Permissions
| Permission | Access |
| --- | --- |
| Create institution | Yes |
| Deactivate institution | Yes |
| Manage subscriptions | Yes |
| View all institutions | Yes |
| Manage platform settings | Yes |
| Access institution results | No |

### 6.2 University Administrator
The University Administrator manages one institution.

#### Responsibilities
- Configure institution
- Manage users
- Manage academic structure
- Manage students and courses

#### Permissions
| Permission | Access |
| --- | --- |
| Create faculties | Yes |
| Create departments | Yes |
| Create programmes | Yes |
| Create users | Yes |
| Manage students | Yes |
| Manage courses | Yes |
| View results | Yes |
| Publish results | Limited |

### 6.3 Exam Officer
The Exam Officer manages examination processes.

#### Responsibilities
- Verify results
- Approve final results
- Publish approved results
- Generate reports

#### Permissions
| Permission | Access |
| --- | --- |
| View submitted results | Yes |
| Edit approved results | No |
| Approve results | Yes |
| Publish results | Yes |
| Generate reports | Yes |

### 6.4 Dean
The Dean manages faculty-level academic activities.

#### Responsibilities
- Review departmental results
- Approve faculty submissions
- Monitor faculty performance

#### Permissions
| Permission | Access |
| --- | --- |
| View faculty results | Yes |
| Approve departmental results | Yes |
| Edit lecturer marks | No |
| View reports | Yes |

### 6.5 Head of Department (HOD)
The HOD manages departmental results.

#### Responsibilities
- Assign courses
- Review lecturer submissions
- Approve departmental results

#### Permissions
| Permission | Access |
| --- | --- |
| Assign lecturers | Yes |
| View department results | Yes |
| Approve results | Yes |
| Modify submitted marks | Limited |

### 6.6 Lecturer
The Lecturer manages assigned courses.

#### Responsibilities
- Enter student marks
- Submit results
- View assigned courses

#### Permissions
| Permission | Access |
| --- | --- |
| View assigned courses | Yes |
| Enter CA marks | Yes |
| Enter exam marks | Yes |
| Calculate grades | Automatic |
| Approve results | No |

### 6.7 Student
Students can access their academic information.

#### Permissions
| Permission | Access |
| --- | --- |
| View profile | Yes |
| View published results | Yes |
| View GPA/CGPA | Yes |
| Download transcript | Based on permission |

---

## 7. Core System Modules

### 7.1 Institution Management
Allows platform administrators to manage institutions.

Features:
- Institution registration
- Institution profile
- Subscription plans
- Account status

### 7.2 Academic Structure Management
Each institution manages:

- Faculties
- Departments
- Programmes
- Levels
- Semesters
- Academic sessions

Example:

```text
Faculty of Computing
  │
  ▼
Department of Information Technology
  │
  ▼
BSc Information Systems
```

### 7.3 Student Management
The system manages:

- Student registration
- Student profiles
- Programme assignment
- Academic history

### 7.4 Course Management
Institutions can manage:

- Course codes
- Course titles
- Credit hours
- Course assignments

### 7.5 Result Management
The result module handles:

- Continuous Assessment marks
- Examination marks
- Total scores
- Grades
- GPA calculation
- Pass/fail status

Example:

```text
CA = 30
Exam = 60
Total = 90
Grade = A
Grade Point = 5.0
```

---

## 8. Result Approval Workflow
Results follow an approval process to ensure accuracy.

```text
Lecturer
  ↓
Head of Department
  ↓
Dean
  ↓
Exam Officer
  ↓
Published Result
  ↓
Student View
```

Each approval action is recorded in the audit log.

---

## 9. Database Structure
Main database entities include:

- Institutions
- Users
- Roles
- Permissions
- Faculties
- Departments
- Programmes
- Students
- Courses
- Course Allocations
- Semesters
- Academic Sessions
- Results
- GPA Records
- Transcripts
- Notifications
- Audit Logs

---

## 10. Development Roadmap

### Phase 1: Foundation
Develop:
- Authentication
- Institution setup
- User management
- Role permissions
- Database structure

### Phase 2: Academic Management
Develop:
- Students
- Courses
- Departments
- Programmes
- Semester management

### Phase 3: Result Processing
Develop:
- Result entry
- Grade calculation
- GPA calculation
- Approval workflow
- Result publishing

### Phase 4: Advanced Features
Develop:
- Student portal
- Transcript generation
- Reports
- Analytics
- Notifications
- Subscription billing

---

## 11. Conclusion
URMIS is a scalable, multi-tenant SaaS platform designed to modernize academic result management for higher education institutions.

By using Next.js, PostgreSQL, Prisma, and modern security practices, the system provides a reliable foundation that can support multiple institutions while maintaining data security, role-based access, and efficient academic workflows.

The platform starts as a result management solution but has the potential to grow into a complete institutional management system supporting the future digital transformation of education.

---

## Getting Started
This repository contains the initial Next.js foundation for the URMIS platform.

### Run locally
```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.
