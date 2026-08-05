# Task: Build all Lecturer pages correctly and wire routing

## Objective
The Lecturer manages assigned courses, enters scores, submits results, and communicates within one institution. The system uses ONE dashboard with authorization correctly — each role renders only its own menu and permitted pages.

## Steps
- [x] 0. Analyze sidebarConfig LECTURER menu (13 slugs) and existing lecturer pages
- [x] 1. Create Reports page (LecturerReports)
- [x] 2. Create Communication page (LecturerCommunication)
- [x] 3. Create Notifications page (LecturerNotifications)
- [x] 4. Create Profile page (LecturerProfile)
- [x] 5. Create Logout page (LecturerLogout)
- [x] 6. Update lecturer index.js exports (all 13 pages)
- [x] 7. Wire routing in app/dashboard/[slug]/page.tsx (lecturerSlugComponents map + LECTURER role check + sectionMeta)
- [ ] 8. Verify production build compiles successfully
