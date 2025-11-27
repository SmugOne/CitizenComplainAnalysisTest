from flask import Flask, jsonify, request
from flask_cors import CORS  
from dotenv import load_dotenv
import os
import io
import pandas as pd
import joblib
import uuid
import gspread
import json
import math

from oauth2client.service_account import ServiceAccountCredentials
from sklearn.preprocessing import PolynomialFeatures
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from werkzeug.utils import secure_filename
from transformers import pipeline
from collections import Counter
from sklearn.pipeline import make_pipeline
from flask import render_template, send_file, request, jsonify
from datetime import datetime
#For PDF generation
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


#Connection:
load_dotenv()
app = Flask(__name__)
CORS(app)

#-------------------------GOOGLE SHEETS API-------------------------
#Define scope
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

#Load service account credentials
creds = ServiceAccountCredentials.from_json_keyfile_name(
    r"JSON Key/publiccomplaintprogram-1f431cc7f437.json", scope
)
client = gspread.authorize(creds)
spreadsheet = client.open("Main Database")

#Load worksheets
training_sheet = spreadsheet.worksheet("TrainingDataset")
complaints_sheet = spreadsheet.worksheet("ComplaintsData")
arranged_sheet = spreadsheet.worksheet("ArrangedData")
archive_sheet = spreadsheet.worksheet("Archive")
announcements_sheet = spreadsheet.worksheet("Announcements")
accounts_sheet = spreadsheet.worksheet("Accounts")

#Convert sheets to pandas DataFrame
TrainingData = pd.DataFrame(training_sheet.get_all_records())
ComplaintsData = pd.DataFrame(complaints_sheet.get_all_records())
ArrangedData = pd.DataFrame(arranged_sheet.get_all_records())
Archive = pd.DataFrame(archive_sheet.get_all_records())
Announcements = pd.DataFrame(announcements_sheet.get_all_records())
Accounts = pd.DataFrame(accounts_sheet.get_all_records())


#BACKEND DEVELOPMENT ----------------------------------

#-------------------------IMAGE BACKEND-------------------------

#Image Folder:
ImageFolder = os.path.join(os.getcwd(),'ImageFolder')
os.makedirs(ImageFolder, exist_ok=True)
app.config['UPLOAD_FOLDER'] = ImageFolder

#Image upload from ComplaintsFormScreen:
@app.route('/api/uploadImage', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    #Stores image with identifier
    image = request.files['image']
    filename = secure_filename(image.filename)
    imageId = str(uuid.uuid4())  # unique ID for the image
    saved_filename = f"{imageId}_{filename}"
    image.save(os.path.join(app.config['UPLOAD_FOLDER'], saved_filename))

    #push imageid into Image Folder
    return jsonify({
        "message": "Image uploaded successfully",
        "imageId": imageId,
        "file_name": saved_filename,
        "imageUrl": f"/uploads/{saved_filename}"
    })

#-------------------------COMPLAINT INPUT BACKEND-------------------------

#Flask-React Connect and Assign from ComplaintsFormScreen:
@app.route('/api/complaints', methods=['POST'])
def run_arrangement():
    #Distribute Data from ComplaintsFormScreen
    date = request.form.get('date') or ''
    time = request.form.get('time') or ''
    contactno = request.form.get('contactno') or ''
    data = request.get_json()
    name = data.get('name') or 'Anonymous'
    complaint = data.get('complaint') or ''
    location = data.get('location') or ''
    category = data.get('category') or ''
    imageID = data.get('imageID') or ''
    status = data.get('status') or "UNSOLVED" 
    password = data.get('password') or ''
    remark = data.get('remark') or ''
    contact_no = data.get('contact_no') or ''  # Add contact number support
    respondent = data.get('respondent') or ''  # Add respondent support

    #Datasets:
    try:
        existing_records = complaints_sheet.get_all_records()
        df_db = pd.DataFrame(existing_records)
    except:
        df_db = pd.DataFrame()

    #Assign new ID based on last one
    if df_db.empty or 'ID' not in df_db.columns:
        ID = 1
    else:
        ID = int(df_db['ID'].max()) + 1

    #Add new entry to the database (ComplaintsData.csv)
    new_row = [
        date,
        time,
        contactno,
        ID,
        name,
        complaint,
        str(location),
        status,
        str(category),
        str(imageID),
        str(password),
        str(remark),
    ]
    #Timestamp Autogenerate
    current_datetime = datetime.now()
    date_submitted = current_datetime.strftime('%Y-%m-%d')  # Format: 2025-11-27
    time_submitted = current_datetime.strftime('%H:%M:%S')  # Format: 14:30:45

    #Add new entry to the database WITH AUTO TIMESTAMPS
    new_row = {
        'Date': date_submitted,          
        'Time': time_submitted,          
        'Contact No': contact_no,
        'ID': ID,
        'Name': name,
        'Respondent': respondent,
        'Raw Complaint': complaint,
        'Location': str(location),
        'Status': str(status),
        'Category': str(category),
        'Image ID': str(imageID),
        'Password': str(password),
        'Remark': '',
    }
    Database = pd.concat([Database, pd.DataFrame([new_row])], ignore_index=True)
    Database = Database.fillna('')

    #Save updated database and returns it
    complaints_sheet.append_row(new_row)

    Main()

    #Return ID to frontend. Do not remove
    return jsonify({
        "message": "Complaint submitted successfully",
        "ID": ID,
    })

#-------------------------MAIN ALGORITHM LIST BACKEND-------------------------

#Training Model and Classification Algorithms:
def Main():
    #Datasets:
    Database = pd.DataFrame(complaints_sheet.get_all_records())
    Training_Data = pd.DataFrame(training_sheet.get_all_records())

    #Set Status if empty
    Database['Status'] = Database['Status'].replace('', 'UNSOLVED')

    #Training Model (Emotion):
    Training_Data['Emotion'] = Training_Data['Emotion'].str.strip().str.lower()

    X_train = Training_Data['Complaint'].fillna("").str.lower()
    y_train = Training_Data['Emotion']
    TrainingModel = make_pipeline(
        CountVectorizer(lowercase=True),
        MultinomialNB()
    )
    TrainingModel.fit(X_train, y_train)

    #Training Model (Government Agency):
    Training_Data['Government Agency'] = Training_Data['Government Agency'].str.strip().str.upper()

    X_agency = Training_Data['Complaint'].fillna("").str.lower()
    y_agency = Training_Data['Government Agency']
    AgencyModel = make_pipeline( 
        CountVectorizer(lowercase=True),
        MultinomialNB()
    )
    AgencyModel.fit(X_agency, y_agency)

    #Flagged Words:
    prioritizedWords = [
        "corruption", "corrupt", "kurakot", "kinurakot", "kinorakot", "kinukurakot","kinukorakot","nangungurakot",
        "fraud", "harassment", 
        "abuse", "pang-aabuso", "inaabuso", "abuso", "nangaabuso", "nang-aabuso",
        "exploitation", "exploit", "exploited",
        "pagsasamantala", "sinasamantala", "pagsasamantalahan", "samantala", 
        "discrimination", "diskriminasyon", 
    ]

    #Predict emotion scores
    textComplaints = Database['Raw Complaint'].fillna("").tolist()
    probabilities = TrainingModel.predict_proba(textComplaints)
    emotion_labels = TrainingModel.classes_
    emotion_scores = [dict(zip(emotion_labels, prob)) for prob in probabilities]

    #Scores the Database
    Database['Anger Score'] = [score.get('anger', 0) for score in emotion_scores]
    Database['Fear Score'] = [score.get('fear', 0) for score in emotion_scores]
    Database['Joy Score'] = [score.get('joy', 0) for score in emotion_scores]
    Database['Neutral Score'] = [score.get('neutral', 0) for score in emotion_scores]
    Database['Sadness Score'] = [score.get('sadness', 0) for score in emotion_scores]
    Database['Surprise Score'] = [score.get('surprise', 0) for score in emotion_scores]

    #Adds priority words based on prioritizedwords list
    Database['Flagged Words'] = Database['Raw Complaint'].str.lower().apply(
        lambda x: any(word in x for word in prioritizedWords)
    )

    #Sorts by maximum score
    Database['Max Severity Score'] = Database[['Anger Score', 'Sadness Score', 'Fear Score']].max(axis=1)
    Database = Database.sort_values(by=['Flagged Words', 'Max Severity Score'], ascending=[False, False])

    #Rename from Raw Complaint (ComplaintsData) to Complaint (ArrangedData)
    Database = Database.rename(columns={'Raw Complaint': 'Complaint'})
    
    #Add Predicted Agency:
    if 'Category' in Database.columns:
        Database['Predicted Agency'] = Database['Category'].fillna('').str.upper()
        NoAgency = Database['Predicted Agency'].str.strip() == ''
        if NoAgency.any():
            predicted_agencies = AgencyModel.predict(
                Database.loc[NoAgency, 'Complaint'].fillna("").str.lower()
            )
            Database.loc[NoAgency, 'Predicted Agency'] = predicted_agencies
    else:
        predicted_agencies = AgencyModel.predict(Database['Complaint'].fillna("").str.lower())
        Database['Predicted Agency'] = predicted_agencies

    #Final selected output to ArrangedData
    output = Database[[ 
        'ID', 'Name', 'Complaint', 'Location',
        'Anger Score', 'Fear Score', 'Joy Score', 'Neutral Score',
        'Sadness Score', 'Surprise Score',
        'Predicted Agency', 'Flagged Words', 'Image ID', 'Status', 'Password', 'Remark', 'Date', 'Time', 'Contact No'
    ]]

    #Save and return to GSheets
    arranged_sheet.clear()
    arranged_sheet.update([output.columns.values.tolist()] + output.values.tolist())
    return output

#-------------------------UPDATE COMPLAINT BACKEND-------------------------
    #Update ComplaintsData.csv
    # list_path = "CSVFile/ComplaintsData.csv"
    # comp_list = pd.read_csv(list_path, encoding='cp1252')
    # if "Remark" not in comp_list.columns:
    #     comp_list["Remark"] = ""
    
    # comp_list.loc[comp_list['ID'].astype(str) == complaint_id, ['Status', 'Category', 'Remark']] = [status, agency, remark]
    # comp_list.to_csv(list_path, index=False, encoding='cp1252')

    # #Update Archive.csv - MATCHING YOUR STRUCTURE
    # archive_path = "CSVFile/Archive.csv"
    # if status.upper() in ["SOLVED", "SPAM"]:
    #     archive = pd.read_csv(archive_path, encoding='cp1252') if os.path.exists(archive_path) else pd.DataFrame(columns=[ 
    #         "Date", "Time", "Contact No", "ID", "Name", "Respondent", 
    #         "Complaint", "Location", "Agency", "Image ID", "Status", "Remark", "Feedback"
    #     ])

    #     # Get the row from ComplaintsData
    #     row_to_archive = comp_list.loc[comp_list['ID'].astype(str) == complaint_id].copy()
        
    #     if not row_to_archive.empty:
    #         # Map columns to Archive.csv structure
    #         archive_row = pd.DataFrame([{
    #             'Date': row_to_archive['Date'].values[0],
    #             'Time': row_to_archive['Time'].values[0],
    #             'Contact No': row_to_archive.get('Contact No', [''])[0] if 'Contact No' in row_to_archive.columns else '',
    #             'ID': row_to_archive['ID'].values[0],
    #             'Name': row_to_archive['Name'].values[0],
    #             'Respondent': row_to_archive.get('Respondent', [''])[0] if 'Respondent' in row_to_archive.columns else '',
    #             'Complaint': row_to_archive['Raw Complaint'].values[0],
    #             'Location': row_to_archive['Location'].values[0],
    #             'Agency': agency,
    #             'Image ID': row_to_archive['Image ID'].values[0],
    #             'Status': status,
    #             'Remark': remark,
    #             'Feedback': ''
    #         }])

    #         # Check if ID already exists in archive (prevent duplicates)
    #         if complaint_id not in archive['ID'].astype(str).values:
    #             archive = pd.concat([archive, archive_row], ignore_index=True)
    #         else:
    #             # Update existing archive entry
    #             archive.loc[archive['ID'].astype(str) == complaint_id, [
    #                 'Status', 'Agency', 'Remark'
    #             ]] = [status, agency, remark]
            
    #         archive.to_csv(archive_path, index=False, encoding='cp1252')

    # return jsonify({"success": True})

#-------------------------TRACK COMPLAINT BACKEND-------------------------

#Track Complaint Status from TrackComplaintScreen:
@app.route('/api/complaints/track/<complaint_id>', methods=['GET'])
def track_complaint(complaint_id):
    complaint_id = str(complaint_id).strip()
    
    #Load live complaints
    ArrangedData = pd.DataFrame(arranged_sheet.get_all_records())
    found_live = ArrangedData[ArrangedData['ID'].astype(str) == complaint_id]

    if not found_live.empty:
        complaint_data = found_live.iloc[0].to_dict()
        status = complaint_data['Status'].upper()
        
        if status in ['UNSOLVED']:
            complaint_data['Remarks'] = ""
            return jsonify({"found": True, "complaint": complaint_data})
        
        #If SOLVED or SPAM, fetch archive for Remarks
        df_archive = pd.DataFrame(archive_sheet.get_all_records())
        found_archive = df_archive[df_archive['ID'].astype(str) == complaint_id]
        
        if not found_archive.empty:
            complaint_data['Remarks'] = found_archive.iloc[0].get('Remark', '')
        else:
            complaint_data['Remarks'] = ""
        
        return jsonify({"found": True, "complaint": complaint_data})

    return jsonify({"found": False, "message": "Complaint ID not found."})

#-------------------------ADMIN DASHBOARD BACKEND-------------------------

#Sends Complaints for Admin Dashboard:
@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    try:
        df = pd.DataFrame(arranged_sheet.get_all_records())
        df = df.fillna('')
    except FileNotFoundError:
        df = Main()

    #Replace all NaN, NaT, and pd.NA values with None
    df = df.replace({pd.NA: None, pd.NaT: None, float('nan'): None})

    #Ensure ID is int
    df['ID'] = df['ID'].astype(str).str.strip().replace('', '0')
    df['ID'] = df['ID'].apply(lambda x: str(int(float(x))) if x.replace('.', '', 1).isdigit() else x)

    return jsonify(df.to_dict(orient='records')) 

#Sends Statistics for Admin Dashboard:
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        df = pd.DataFrame(arranged_sheet.get_all_records())
    except FileNotFoundError:
        try:
            df = Main()
        except Exception as e:
            print(f"ERROR - Could not load or generate data: {e}")
            return jsonify({
                "categoryCounts": {},
                "statusCounts": {},
                "complaints": []
            }), 200
    
    #Normalize column names
    df.columns = df.columns.str.strip()
    
    #Fill NaN values
    df = df.fillna('')
    
    #Define expected categories and statuses
    valid_agencies = [
        "DPWH", "DOH", "DENR", "OMBUDSMAN",
        "LTO", "MMDA", "PNP", "DEPED",
        "BFP", "DOTR", "DITC", "NONE"
    ]
    
    valid_statuses = ["SOLVED", "SPAM", "UNDER REVIEW", "UNSOLVED"]
    
    #Get the category column (Predicted Agency or Category)
    category_col = "Predicted Agency" if "Predicted Agency" in df.columns else "Category"
    status_col = "Status" if "Status" in df.columns else None
    
    #Initialize counts
    category_counts = {agency: 0 for agency in valid_agencies}
    status_counts = {status: 0 for status in valid_statuses}
    complaints = []
    
    try:
        # Count categories with normalization
        if category_col in df.columns:
            normalized_categories = df[category_col].astype(str).str.strip().str.upper()
            for agency in valid_agencies:
                count = (normalized_categories == agency).sum()
                category_counts[agency] = int(count)
        
        # Count statuses with normalization
        if status_col and status_col in df.columns:
            normalized_statuses = df[status_col].astype(str).str.strip().str.upper()
            for status in valid_statuses:
                count = (normalized_statuses == status).sum()
                status_counts[status] = int(count)
        
        # Prepare complaints array for filtering
        if category_col in df.columns and status_col and status_col in df.columns:
            for _, row in df.iterrows():
                status = str(row[status_col]).strip().upper()
                category = str(row[category_col]).strip().upper()
                
                # Only include valid entries
                if status in valid_statuses and category in valid_agencies:
                    complaints.append({
                        'status': status,
                        'category': category
                    })
        
    except Exception as e:
        print(f"ERROR in stats processing: {e}")
        import traceback
        traceback.print_exc()
    
    response_data = {
        "categoryCounts": category_counts,
        "statusCounts": status_counts,
        "complaints": complaints
    }
    
    return jsonify(response_data)

#Update ComplaintList and ArrangedComplaint for Admin Dashboard:
@app.route('/api/complaints/update', methods=['POST'])
def update_complaint():
    data = request.get_json()

    allowed_agencies = [
        "DPWH", "DOH", "DENR", "OMBUDSMAN", "LTO", "MMDA", 
        "PNP", "DEPED", "BFP", "DOTR", "DITC", "NONE",
    ]

    complaint_id = str(data.get("id"))
    status = data.get("status")
    agency = data.get("agency", "NONE")
    remark = data.get("remark", "")

    if agency not in allowed_agencies:
        return jsonify({"error": "Invalid agency"}), 400

    # Change UNSOLVED → UNDER REVIEW if remark exists
    if status == "UNSOLVED" and remark.strip() != "":
        status = "UNDER REVIEW"

    # -----------------------------
    # UPDATE ARRANGED SHEET
    # -----------------------------
    arranged = pd.DataFrame(arranged_sheet.get_all_records())
    
    # Ensure columns exist
    for col in ["ID", "Status", "Predicted Agency"]:
        if col not in arranged.columns:
            arranged[col] = ""
        else:
            arranged[col] = arranged[col].fillna("").replace([float("inf"), float("-inf")], "")

    arranged.loc[
        arranged["ID"].astype(str) == complaint_id,
        ["Status", "Predicted Agency"]
    ] = [status, agency]

    arranged_sheet.update(
        [arranged.columns.tolist()] + arranged.astype(str).values.tolist()
    )

    # -----------------------------
    # UPDATE COMPLAINTS SHEET
    # -----------------------------
    comp_list = pd.DataFrame(complaints_sheet.get_all_records())

    required_cols = ["ID", "Status", "Category", "Remark", "Location", "Image ID", "Raw Complaint", "Name"]
    for col in required_cols:
        if col not in comp_list.columns:
            comp_list[col] = ""
        else:
            comp_list[col] = comp_list[col].fillna("").replace([float("inf"), float("-inf")], "")

    comp_list.loc[
        comp_list["ID"].astype(str) == complaint_id,
        ["Status", "Category", "Remark"]
    ] = [status, agency, remark]

    complaints_sheet.update(
        [comp_list.columns.tolist()] + comp_list.astype(str).values.tolist()
    )

    # -----------------------------
    # UPDATE ARCHIVE SHEET
    # -----------------------------
    if status.upper() in ["SOLVED", "SPAM"]:
        archive = pd.DataFrame(archive_sheet.get_all_records())

        row = comp_list.loc[
            comp_list["ID"].astype(str) == complaint_id,
            ["Date", "Time", "Contact No", "ID", "Name", "Raw Complaint", "Location", "Category",
             "Image ID", "Status", "Remark"]
        ].copy()

        # Rename for archive
        row = row.rename(columns={
            "Raw Complaint": "Complaint",
            "Category": "Agency"
        })

        # Ensure all archive columns exist and are strings
        for col in ["Date", "Time", "Contact No", "ID", "Name", "Complaint", "Location", "Agency", "Image ID", "Status", "Remark"]:
            if col not in archive.columns:
                archive[col] = ""
            if col in row.columns:
                row[col] = row[col].fillna("").replace([float("inf"), float("-inf")], "")
            else:
                row[col] = ""

        archive = pd.concat([archive, row], ignore_index=True)
        archive_sheet.update(
            [archive.columns.tolist()] + archive.astype(str).values.tolist()
        )


#-------------------------FEEDBACK BACKEND-------------------------

@app.route("/api/complaints/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()
    complaint_id = str(data.get("ID", "")).strip()
    feedback = data.get("Feedback", "").strip()

    if not complaint_id or not feedback:
        return jsonify({"success": False, "message": "Missing ID or feedback"})

    #Load sheets
    arranged_path = pd.DataFrame(arranged_sheet.get_all_records())
    archive = pd.DataFrame(archive_sheet.get_all_records())

    #Ensure Feedback column exists
    if "Feedback" not in archive.columns:
        archive["Feedback"] = ""
    archive["Feedback"] = archive["Feedback"].fillna("")

    #Check if complaint exists in Archive or ArrangedData
    if complaint_id not in archive['ID'].astype(str).values and \
       complaint_id not in arranged_path['ID'].astype(str).values:
        return jsonify({"success": False, "message": "Complaint ID not found"})

    #Check if feedback already submitted
    if complaint_id in archive['ID'].astype(str).values:
        existing_feedback = archive.loc[archive['ID'].astype(str) == complaint_id, "Feedback"].values[0]
 
        if str(existing_feedback).strip():
            return jsonify({"success": False, "message": "You already made a feedback."})
        
        # Update existing row
        archive.loc[archive['ID'].astype(str) == complaint_id, "Feedback"] = feedback
    else:
        #Copy from ArrangedData
        row_to_archive = arranged_path.loc[arranged_path['ID'].astype(str) == complaint_id].copy()
        row_to_archive["Feedback"] = feedback
        archive = pd.concat([archive, row_to_archive], ignore_index=True)

    #Update Google Sheet
    archive_sheet.clear()
    archive_sheet.update([archive.columns.values.tolist()] + archive.values.tolist())

    return jsonify({"success": True, "message": "Feedback submitted"})

#-------------------------COMPLAINT LIST SCREEN BACKEND-------------------------

#Active Complaints
@app.route("/api/complaints/all")
def get_active_complaints():
    records = arranged_sheet.get_all_records()
    if records:
        df = pd.DataFrame(records).fillna('')
    else:
        df = pd.DataFrame(columns=[
            "Date", "Time", "Contact No", "ID", "Name", "Raw Complaint", "Location",
            "Category", "Image ID", "Status", "Password", "Remark"
        ])
    df = df[df["Status"].isin(["UNSOLVED", "UNDER REVIEW"])]
    return jsonify(df.to_dict(orient="records"))

#Archive Complaints
@app.route("/api/archive_complaints")
def get_archive_complaints():
    records = archive_sheet.get_all_records()
    if records:  # Check if the sheet has any records
        df = pd.DataFrame(records).fillna('')
    else:
        df = pd.DataFrame(columns=[
            "Date", "Time", "Contact No", "ID", "Name", "Complaint", "Location",
            "Agency", "Image ID", "Status", "Remark", "Feedback"
        ])
    df = df[df["Status"].isin(["SOLVED", "SPAM"])]
    return jsonify(df.to_dict(orient="records"))

#-------------------------ANNOUNCEMENT EDIT BACKEND-------------------------

#Shows announcements
@app.route('/api/announcements', methods=['GET'])
def get_announcements():
    records = announcements_sheet.get_all_records()

    ar = pd.DataFrame(records).fillna('')
    ar['Space'] = pd.to_numeric(ar['Space'], errors='coerce').fillna(0).astype(int)
    ar = ar.sort_values(by='Space')

    return jsonify([
        {
            "space": int(row["Space"]),
            "title": row["Title"],
            "body": row["Body"],
        }
        for _, row in ar.iterrows()
    ])

#Updates announcements
@app.route('/api/announcements', methods=['POST'])
def update_announcement():
    data = request.get_json()
    space = int(data.get("Space"))
    title = data.get("Title") or ""
    body = data.get("Body") or ""

    records = announcements_sheet.get_all_records()
    ar = pd.DataFrame(records).fillna('')
    ar['Space'] = pd.to_numeric(ar['Space'], errors='coerce').fillna(0).astype(int)

    #Update existing
    if space in ar['Space'].values:
        ar.loc[ar['Space'] == space, ['Title', 'Body']] = [title, body]
    else:
        #Insert new entry
        new_row = {"Space": space, "Title": title, "Body": body}
        ar = pd.concat([ar, pd.DataFrame([new_row])], ignore_index=True)

    ar = ar.sort_values(by='Space').reset_index(drop=True)

    #Rewrite the whole sheet
    announcements_sheet.clear()
    announcements_sheet.update([ar.columns.values.tolist()] + ar.values.tolist())

    return jsonify({"message": "Announcement updated"}), 200

#-------------------------ACCOUNT LOGIN BACKEND-------------------------
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400

    df = pd.DataFrame(accounts_sheet.get_all_records())

    #Ensure proper string conversion & strip whitespace
    df['Username'] = df['Username'].astype(str).str.strip()
    df['Password'] = df['Password'].astype(str).str.strip()

    matched = df[
        (df['Username'] == username) &
        (df['Password'] == password)
    ]

    if not matched.empty:
        return jsonify({"success": True, "message": "Login successful"})
    else:
        return jsonify({"success": False, "message": "Incorrect username or password"}), 401
    
#-------------------------NEW ACCOUNT BACKEND-------------------------
#For future: add hashlib for password hashing
@app.route('/api/admins', methods=['POST'])
def NewAdmins():
    data = request.get_json()
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()
    full_name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()

    #Check required fields before passing
    if not username or not password:
        return jsonify({"success": False, "message": "Username, password, and name are required"}), 400

    #Load accounts from Google Sheet
    df = pd.DataFrame(accounts_sheet.get_all_records())

    #Check if username already exists
    if username in df["Username"].astype(str).tolist():
        return jsonify({"success": False, "message": "Username already exists"}), 400

    new_row = {
        "Username": username,
        "Password": password,
        "Full Name": full_name,
        "Email": email
    }

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

    #Push back to Google Sheet
    accounts_sheet.clear()
    accounts_sheet.update([df.columns.values.tolist()] + df.values.tolist())

    return jsonify({"success": True, "message": "Admin account created"})


@app.route('/api/admins', methods=['GET'])
def get_admin_list():
    #Load accounts from Google Sheet
    df = pd.DataFrame(accounts_sheet.get_all_records())
    return jsonify(df.to_dict(orient="records"))


#-------------------------REPORT GENERATOR-------------------------
@app.route('/api/reports')
def reports_page():
    """Render the reports page"""
    try:
        return render_template('reports.html')
    except Exception as e:
        print(f"ERROR loading reports page: {e}")
        return jsonify({'error': 'Could not load reports page', 'details': str(e)}), 500

@app.route('/api/generate-report', methods=['POST', 'GET'])
def generate_report():
    """Generate PDF report (ReportLab) based on selected parameters"""
    try:
        # --- Extract params (support POST form and GET query) ---
        if request.method == 'POST':
            report_type = request.form.get('report_type', 'summary')
            date_from = request.form.get('date_from', '')
            date_to = request.form.get('date_to', '')
            category = request.form.get('category', 'all')
        else:
            report_type = request.args.get('report_type', 'summary')
            date_from = request.args.get('date_from', '')
            date_to = request.args.get('date_to', '')
            category = request.args.get('category', 'all')

        print(f"Generating (ReportLab) {report_type} report - Category: {category}, From: {date_from}, To: {date_to}")

        # --- Build report data using your existing function ---
        report_data = fetch_report_data(report_type, date_from, date_to, category)

        # --- Prepare PDF buffer ---
        buffer = io.BytesIO()

        # Choose page size (A4 recommended for reports)
        page_size = A4

        doc = SimpleDocTemplate(
            buffer,
            pagesize=page_size,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm,
        )

        # --- Register a UTF-8 font if available (optional) ---
        try:
            # Try to register DejaVuSans if font file exists in project root or known path
            font_path = os.path.join(os.getcwd(), "fonts", "DejaVuSans.ttf")
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont("DejaVuSans", font_path))
                base_font_name = "DejaVuSans"
            else:
                # fallback: attempt to register common system font path (windows)
                alt_path = r"C:\Windows\Fonts\DejaVuSans.ttf"
                if os.path.exists(alt_path):
                    pdfmetrics.registerFont(TTFont("DejaVuSans", alt_path))
                    base_font_name = "DejaVuSans"
                else:
                    base_font_name = "Helvetica"
        except Exception:
            base_font_name = "Helvetica"

        # --- Styles ---
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name="ReportTitle", fontName=base_font_name, fontSize=18, leading=22, spaceAfter=8))
        styles.add(ParagraphStyle(name="SubTitle", fontName=base_font_name, fontSize=12, leading=14, spaceAfter=6))
        styles.add(ParagraphStyle(name="Small", fontName=base_font_name, fontSize=9, leading=11))
        normal = ParagraphStyle(name="NormalCustom", fontName=base_font_name, fontSize=10, leading=12)

        elements = []

        # --- Header / Title ---
        title_text = report_data.get("title", "Complaint Report")
        elements.append(Paragraph(title_text, styles["ReportTitle"]))
        meta = f"Generated: {report_data.get('generated_date', '')}  |  Type: {report_data.get('report_type','')}"
        elements.append(Paragraph(meta, styles["SubTitle"]))
        elements.append(Spacer(1, 8))

        # --- Summary boxes (totals) ---
        totals_table = [
            ["Total Complaints", str(report_data.get("total_complaints", 0))],
            ["Resolved", str(report_data.get("resolved", 0))],
            ["Pending", str(report_data.get("pending", 0))],
            ["Spam", str(report_data.get("spam", 0))],
            ["Flagged", str(report_data.get("flagged", 0))],
            ["Resolution Rate", f"{report_data.get('resolution_rate', 0)}%"],
            ["Date Range", f"{report_data.get('date_from')} → {report_data.get('date_to')}"],
            ["Category Filter", report_data.get("category", "All Categories")]
        ]
        t = Table(totals_table, colWidths=[90*mm, 80*mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#11493f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, -1), base_font_name),
            ("FONTSIZE", (0,0), (-1,-1), 10),
            ("GRID", (0,0), (-1,-1), 0.25, colors.grey),
            ("BACKGROUND", (0,1), (-1,-1), colors.whitesmoke),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 12))

        # --- Category breakdown table ---
        categories = report_data.get("categories", [])
        if categories:
            elements.append(Paragraph("Category breakdown", styles["SubTitle"]))
            cat_data = [["Agency", "Count"]] + [[c["name"], str(c["count"])] for c in categories]
            cat_table = Table(cat_data, colWidths=[100*mm, 70*mm])
            cat_table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#197278")),
                ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("GRID", (0,0), (-1,-1), 0.25, colors.grey),
                ("ALIGN", (1,1), (-1,-1), "CENTER"),
            ]))
            elements.append(cat_table)
            elements.append(Spacer(1, 10))

        # --- Location breakdown ---
        locations = report_data.get("locations", [])
        if locations:
            elements.append(Paragraph("Top locations", styles["SubTitle"]))
            loc_data = [["Location", "Count"]] + [[l["name"], str(l["count"])] for l in locations]
            loc_table = Table(loc_data, colWidths=[120*mm, 50*mm])
            loc_table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#11493f")),
                ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("GRID", (0,0), (-1,-1), 0.25, colors.grey),
                ("ALIGN", (1,1), (-1,-1), "CENTER"),
            ]))
            elements.append(loc_table)
            elements.append(Spacer(1, 10))

        # --- Emotion averages ---
        emotions = report_data.get("emotions", {})
        if emotions:
            elements.append(Paragraph("Average emotion scores", styles["SubTitle"]))
            emo_data = [["Emotion", "Average Score"]] + [[k, str(v)] for k, v in emotions.items()]
            emo_table = Table(emo_data, colWidths=[120*mm, 50*mm])
            emo_table.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#197278")),
                ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("GRID", (0,0), (-1,-1), 0.25, colors.grey),
                ("ALIGN", (1,1), (-1,-1), "CENTER"),
            ]))
            elements.append(emo_table)
            elements.append(Spacer(1, 10))

        # --- Detailed complaints list when requested ---
        if report_type == "detailed":
            complaints_list = report_data.get("complaints", [])
            elements.append(PageBreak())
            elements.append(Paragraph("Detailed complaints (first 50)", styles["ReportTitle"]))
            elements.append(Spacer(1, 6))

            # header row
            detail_rows = [["ID", "Name", "Agency", "Status", "Location", "Complaint (truncated)"]]
            for c in complaints_list:
                detail_rows.append([
                    c.get("id", ""),
                    c.get("name", ""),
                    c.get("agency", ""),
                    c.get("status", ""),
                    c.get("location", ""),
                    (c.get("complaint", "")[:200] + ("..." if len(c.get("complaint",""))>200 else ""))
                ])

            # Limit column widths and allow wrapping
            detail_table = Table(detail_rows, colWidths=[18*mm, 30*mm, 28*mm, 28*mm, 30*mm, 60*mm])
            detail_table.setStyle(TableStyle([
                ("GRID", (0,0), (-1,-1), 0.25, colors.grey),
                ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#11493f")),
                ("TEXTCOLOR", (0,0), (-1,0), colors.white),
                ("FONTNAME", (0,0), (-1,0), base_font_name),
                ("FONTSIZE", (0,0), (-1,-1), 8),
            ]))
            elements.append(detail_table)
            elements.append(Spacer(1, 10))

        # --- Trend / Category special pages (basic) ---
        if report_type == "trend":
            elements.append(PageBreak())
            elements.append(Paragraph("Trend analysis (basic)", styles["ReportTitle"]))
            elements.append(Paragraph("If you want charts in the PDF, generate images (matplotlib) and draw them here.", normal))
            elements.append(Spacer(1, 8))

        if report_type == "category":
            elements.append(PageBreak())
            elements.append(Paragraph("Category analysis (detailed)", styles["ReportTitle"]))
            elements.append(Spacer(1, 6))
            elements.append(Paragraph("Use the categories table above for quick counts. For richer visuals, embed charts.", normal))
            elements.append(Spacer(1, 6))

        # Build the PDF
        doc.build(elements)

        buffer.seek(0)

        # Filename creation
        if date_from and date_to:
            filename = f"complaint_report_{report_type}_{date_from}_to_{date_to}.pdf"
        else:
            filename = f"complaint_report_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        print(f"✓ PDF (ReportLab) generated successfully: {filename}")

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )

    except FileNotFoundError as e:
        print(f"ERROR: Template or resource not found - {e}")
        return jsonify({'error': 'Required resource not found.', 'details': str(e)}), 500
    except Exception as e:
        print(f"ERROR generating report (ReportLab): {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate report', 'details': str(e)}), 500

@app.route('/api/preview-report', methods=['POST', 'GET'])
def preview_report():
    """Preview report in HTML format before generating PDF - Supports both POST and GET"""
    try:
        # Support both POST (form) and GET (query params) for React Native
        if request.method == 'POST':
            report_type = request.form.get('report_type', 'summary')
            date_from = request.form.get('date_from', '')
            date_to = request.form.get('date_to', '')
            category = request.form.get('category', 'all')
        else:  # GET method
            report_type = request.args.get('report_type', 'summary')
            date_from = request.args.get('date_from', '')
            date_to = request.args.get('date_to', '')
            category = request.args.get('category', 'all')
        
        print(f"Previewing {report_type} report - Category: {category}, From: {date_from}, To: {date_to}")
        
        # Fetch actual data
        report_data = fetch_report_data(report_type, date_from, date_to, category)
        
        return render_template('report_template.html', data=report_data)
        
    except FileNotFoundError as e:
        print(f"ERROR: Template file not found - {e}")
        return f"<h1>Error: Template not found</h1><p>{str(e)}</p><p>Make sure 'report_template.html' exists in the templates folder.</p>", 500
    except Exception as e:
        print(f"ERROR previewing report: {e}")
        import traceback
        traceback.print_exc()
        return f"<h1>Error generating preview</h1><p>{str(e)}</p>", 500

def fetch_report_data(report_type, date_from, date_to, category):
    """
    Fetch and process complaint data for reports WITH DATE FILTERING
    """
    arranged_path = 'CSVFile/ArrangedData.csv'
    archive_path = 'CSVFile/Archive.csv'
    
    print(f"Loading data from: {arranged_path} and {archive_path}")
    
    # Load active complaints
    if os.path.exists(arranged_path):
        df_active = pd.read_csv(arranged_path, encoding='cp1252').fillna('')
        print(f"✓ Loaded {len(df_active)} active complaints")
    else:
        df_active = pd.DataFrame()
        print(f"⚠ ArrangedData.csv not found")
    
    # Load archived complaints
    if os.path.exists(archive_path):
        df_archive = pd.read_csv(archive_path, encoding='cp1252').fillna('')
        print(f"✓ Loaded {len(df_archive)} archived complaints")
    else:
        df_archive = pd.DataFrame()
        print(f"⚠ Archive.csv not found")
    
    # Combine both dataframes
    df = pd.concat([df_active, df_archive], ignore_index=True)
    print(f"Total complaints before filtering: {len(df)}")
    
    # Filter by category
    if category != 'all':
        initial_count = len(df)
        if 'Predicted Agency' in df.columns:
            df = df[df['Predicted Agency'].str.strip().str.upper() == category.upper()]
        elif 'Agency' in df.columns:
            df = df[df['Agency'].str.strip().str.upper() == category.upper()]
        print(f"After category filter ({category}): {len(df)} complaints (removed {initial_count - len(df)})")
    
    # DATE FILTERING - IMPROVED
    if 'Date' in df.columns and not df.empty:
        # Convert Date column to datetime
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        
        initial_count = len(df)
        
        if date_from:
            date_from_dt = pd.to_datetime(date_from)
            df = df[df['Date'] >= date_from_dt]
            print(f"After date_from filter ({date_from}): {len(df)} complaints")
        
        if date_to:
            date_to_dt = pd.to_datetime(date_to)
            df = df[df['Date'] <= date_to_dt]
            print(f"After date_to filter ({date_to}): {len(df)} complaints")
    
    print(f"Final complaint count: {len(df)}")
    
    # Calculate statistics
    total_complaints = len(df)
    resolved = len(df[df['Status'].str.strip().str.upper() == 'SOLVED']) if 'Status' in df.columns else 0
    spam = len(df[df['Status'].str.strip().str.upper() == 'SPAM']) if 'Status' in df.columns else 0
    pending = len(df[df['Status'].str.strip().str.upper().isin(['UNSOLVED', 'UNDER REVIEW'])]) if 'Status' in df.columns else 0
    
    # Category breakdown
    category_col = 'Predicted Agency' if 'Predicted Agency' in df.columns else 'Agency'
    categories = []
    if category_col in df.columns and not df.empty:
        df[category_col] = df[category_col].astype(str).str.strip().str.upper()
        category_counts = df[category_col].value_counts().to_dict()
        categories = [{'name': k, 'count': int(v)} for k, v in category_counts.items() if k and k != '']
        categories = sorted(categories, key=lambda x: x['count'], reverse=True)
    
    # Location breakdown (top 5)
    location_breakdown = []
    if 'Location' in df.columns and not df.empty:
        df['Location'] = df['Location'].astype(str).str.strip()
        location_counts = df[df['Location'] != '']['Location'].value_counts().head(5).to_dict()
        location_breakdown = [{'name': k, 'count': int(v)} for k, v in location_counts.items()]
    
    # Emotion analysis
    emotion_scores = {}
    emotion_cols = ['Anger Score', 'Fear Score', 'Joy Score', 'Neutral Score', 'Sadness Score', 'Surprise Score']
    for col in emotion_cols:
        if col in df.columns and not df.empty:
            numeric_scores = pd.to_numeric(df[col], errors='coerce')
            avg_score = numeric_scores.mean()
            if not pd.isna(avg_score):
                emotion_scores[col.replace(' Score', '')] = round(avg_score, 2)
    
    # Count flagged complaints
    flagged_count = 0
    if 'Flagged Words' in df.columns and not df.empty:
        flagged_count = int((df['Flagged Words'] == True).sum())
    
    # Prepare report data
    report_data = {
        'title': f'{report_type.title()} Complaint Report',
        'report_type': report_type,
        'generated_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'date_from': date_from if date_from else 'All Time',
        'date_to': date_to if date_to else 'Present',
        'category': category.upper() if category != 'all' else 'All Categories',
        'total_complaints': total_complaints,
        'resolved': resolved,
        'spam': spam,
        'pending': pending,
        'flagged': flagged_count,
        'categories': categories,
        'locations': location_breakdown,
        'emotions': emotion_scores,
        'resolution_rate': round((resolved / total_complaints * 100), 1) if total_complaints > 0 else 0,
    }
    
    # Add detailed complaint list for detailed reports
    if report_type == 'detailed' and not df.empty:
        complaint_list = []
        for _, row in df.head(50).iterrows():
            complaint_text = row.get('Complaint', row.get('Raw Complaint', ''))
            
            complaint_list.append({
                'id': str(row.get('ID', '')),
                'name': row.get('Name', 'Anonymous'),
                'complaint': str(complaint_text)[:200] + '...' if len(str(complaint_text)) > 200 else str(complaint_text),
                'location': row.get('Location', ''),
                'agency': row.get('Predicted Agency', row.get('Agency', '')),
                'status': row.get('Status', ''),
            })
        report_data['complaints'] = complaint_list
    
    print(f"✓ Report data prepared: {total_complaints} total, {resolved} resolved, {pending} pending")
    
    return report_data

#-------------------------END POINT-------------------------

#Back and Front end connection:
if __name__ == '__main__':
    Main()  #Run once
    app.run(host="0.0.0.0", port=5000, debug=True)