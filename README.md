# Engage_project

Website hosted on azure at https://testpragati.azurewebsites.net/

#Features:

1. Allows authentication for 2 roles, teacher and student. Once authenticated, the interface is shown based on the role.

2. Allows a teacher to schedule classes by selecting the year in university(1st,2nd, 3rd or 4th), department, subject, start date and time, and duration. Class can be scheduled only after current time. 
If the start time and duration overlaps with a class already scheduled, for example If teacherA is trying to schedule a class at 3:30 PM, but teacherB already scheduled a class
for the same department and year at 3PM for duration of 50 minutes, then teacher A cannot schedule the class. This feature covers all cases in which overlap can take place.

3. Once class is scheduled, an email is sent to all the students of the concerned year and department stating the subject, start time and duration of their class.

4. The teacher can select an year and department to see all the classes scheduled respectively. These classes are always shown in ascending order of start time, 
and only those classes are shown which are scheduled from today(i.e classes scheduled on current date and later).

5. The teacher can likewise see all the classes he/she scheduled on current date and later.

6. The student can see the classes scheduled for their year and department.

Login for teacher:

Email address: teacher@gmail.com
password: teacher123..

Login for student:

Email address: pragatijoshi@gmail.com
password: student123..

Technology used:

1. HTML, CSS, javascript
2. JQuery
3. Node.js
4. MySQL
5. Express
6. Pug

Azure MySQL database used,

1. Name of database: testDB
2. Tables: 
  i. students: (student_id varchar(50), name varchar(50), dept_id int, phone varchar(20), email varchar(40), year int)
  ii. teacher: (teacher_id varchar(50), name varchar(30), phone varchar(20), email varchar(20))
  iii. classes: (teacher_id varchar(50), year int, dept_id int, subject varchar(30), startDate datetime, endDate datetime)
  iv. departments: (dept_id int, name varchar(30));
