# SmartCheck CRM Schema

Create one Google Spreadsheet with tabs:

## STUDENTS
student_id,student_name,class,section,father_name,mother_name,father_mobile,mother_mobile,status

## HOSTS
host_id,name,department,room_no,mobile,email,role,status

## TICKETS
ticket_id,ticket_type,subject_id,subject_name,reason,current_step,current_assignee,status,created_at,updated_at,qr_token,qr_expiry,closed_at

## TICKET_ACTIONS
action_id,ticket_id,step,action_by,action_role,action_type,remarks,timestamp

## VEHICLES
vehicle_id,ticket_id,vehicle_number,photo_url,captured_at

## WORKFLOW_STEPS
workflow_id,ticket_type,step_number,role,action_required,next_step
