from flask import Flask, jsonify, request
from flask_cors import CORS  
from dotenv import load_dotenv
import os
import pandas as pd
import joblib
import uuid
import gspread
import json

from oauth2client.service_account import ServiceAccountCredentials
from sklearn.preprocessing import PolynomialFeatures
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from werkzeug.utils import secure_filename
from transformers import pipeline
from collections import Counter
from sklearn.pipeline import make_pipeline

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
    data = request.get_json()
    name = data.get('name') or 'Anonymous'
    complaint = data.get('complaint') or ''
    location = data.get('location') or ''
    category = data.get('category') or ''
    imageID = data.get('imageID') or ''
    status = data.get('status') or "UNSOLVED" 
    password = data.get('password') or ''

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

    #Add new entry to the database
    new_row = [
        ID,
        name,
        complaint,
        str(location),
        str(category),
        str(imageID),
        str(status),
        str(password),
        ""  # Remark field
    ]

    #Save updated database and returns it
    complaints_sheet.append_row(new_row)

    Main()

    #Return ID to frontend. Do not remove
    return jsonify({
        "message": "Complaint submitted successfully",
        "ID": str(new_row)
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
        'Predicted Agency', 'Flagged Words', 'Image ID', 'Status', 'Password', 'Remark',
    ]]

    #Save and return to GSheets
    arranged_sheet.clear()
    arranged_sheet.update([output.columns.values.tolist()] + output.values.tolist())
    return output

#-------------------------TRACK COMPLAINT BACKEND-------------------------

#Track Complaint Status from TrackComplaintScreen:
@app.route('/api/complaints/track/<complaint_id>', methods=['GET'])
def track_complaint(complaint_id):
    complaint_id = str(complaint_id).strip()
    
    # Load live complaints from Google Sheets
    ArrangedData = pd.DataFrame(arranged_sheet.get_all_records())
    ArchiveData = pd.DataFrame(archive_sheet.get_all_records())

    found_live = ArrangedData[ArrangedData['ID'].astype(str) == complaint_id]

    if not found_live.empty:
        complaint_data = found_live.iloc[0].to_dict()
        status = complaint_data['Status'].upper()
        
        if status == 'UNSOLVED':
            complaint_data['Remark'] = ""
        else:
            #If SOLVED or SPAM, fetch archive for Remark
            found_archive = ArchiveData[ArchiveData['ID'].astype(str) == complaint_id]
            complaint_data['Remark'] = found_archive.iloc[0].get('Remark', '') if not found_archive.empty else ""
        
        return jsonify({"found": True, "complaint": complaint_data})

    return jsonify({"found": False, "message": "Complaint ID not found."})

#-------------------------ADMIN DASHBOARD BACKEND-------------------------

#Sends Complaints for Admin Dashboard:
@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    try:
        df = pd.read_csv('CSVFile/ArrangedData.csv')
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
        df = pd.read_csv('CSVFile/ArrangedData.csv', encoding='cp1252')
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
        
        print(f"✓ API /api/admin/stats called successfully")
        print(f"  - Total complaints: {len(complaints)}")
        print(f"  - Status counts: {status_counts}")
        print(f"  - First 3 complaints: {complaints[:3]}")
        
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

    allowed = [
        "DPWH",
        "DOH",
        "DENR",
        "OMBUDSMAN",
        "LTO",
        "MMDA",
        "PNP",
        "DEPED",
        "BFP",
        "DOTR",
        "DITC",
        "NONE",
    ]

    #load data
    complaint_id = str(data.get("id"))
    status = data.get("status")
    agency = data.get("agency", "NONE")
    if agency not in allowed:
        return jsonify({"error": "Invalid agency"}), 400
    remark = data.get("remark")

    #Changes status to UNDER REVIEW if there is remark but status is UNSOLVED
    if status == "UNSOLVED" and remark.strip() != "":
        status = "UNDER REVIEW"

    #Update ArrangedData.csv
    arranged_df = pd.DataFrame(arranged_sheet.get_all_records())
    mask = arranged_df['ID'].astype(str) == complaint_id
    if mask.any():
        arranged_df.loc[mask, ['Status', 'Predicted Agency']] = [status, agency]
        # Push back to Google Sheets
        arranged_sheet.clear()
        arranged_sheet.update([arranged_df.columns.values.tolist()] + arranged_df.values.tolist())

    #Update ComplaintsData.csv (add Remark column if not exists)
    complaints_df = pd.DataFrame(complaints_sheet.get_all_records())
    if "Remark" not in complaints_df.columns:
        complaints_df["Remark"] = ""
    mask = complaints_df['ID'].astype(str) == complaint_id
    if mask.any():
        complaints_df.loc[mask, ['Status', 'Category', 'Remark']] = [status, agency, remark]
        complaints_sheet.clear()
        complaints_sheet.update([complaints_df.columns.values.tolist()] + complaints_df.values.tolist())


    #Update Archive.csv
    if status.upper() in ["SOLVED", "SPAM"]:
        archive_df = pd.DataFrame(archive_sheet.get_all_records())
        
        row_to_archive = complaints_df.loc[complaints_df['ID'].astype(str) == complaint_id, [
            "ID", "Name", "Raw Complaint", "Location", "Category", "Image ID", "Status", "Remark"
        ]].copy()

        #Rename columns for Archive
        row_to_archive = row_to_archive.rename(columns={
            "Raw Complaint": "Complaint",
            "Category": "Agency",
            "Remark": "Remark"
        })

        #Append
        archive_df = pd.concat([archive_df, row_to_archive], ignore_index=True)
        archive_sheet.clear()
        archive_sheet.update([archive_df.columns.values.tolist()] + archive_df.values.tolist())

    return jsonify({"success": True})

#-------------------------FEEDBACK BACKEND-------------------------

@app.route("/api/complaints/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()
    complaint_id = str(data.get("ID", "")).strip()
    feedback = data.get("Feedback", "").strip()

    if not complaint_id or not feedback:
        return jsonify({"success": False, "message": "Missing ID or feedback"})

    #Load Archive and ArrangedData
    arranged_path = pd.DataFrame(arranged_sheet.get_all_records())
    archive = pd.DataFrame(archive_sheet.get_all_records())

    #Check if complaint exists in ArrangedData
    if complaint_id not in archive['ID'].astype(str).values:
        return jsonify({"success": False, "message": "Complaint ID not found"})

    #Check if feedback already submitted
    if complaint_id in archive['ID'].astype(str).values:
        existing_feedback = archive.loc[archive['ID'].astype(str) == complaint_id, "Feedback"].values[0]
        if existing_feedback and existing_feedback.strip() != "":
            return jsonify({"success": False, "message": "You already made a feedback."})

    #Update feedback in Archive.csv
    if complaint_id in archive['ID'].astype(str).values:
        archive.loc[archive['ID'].astype(str) == complaint_id, "Feedback"] = feedback
    else:
        #If complaint is not yet in Archive copy it from ArrangedData
        row_to_archive = archive.loc[archive['ID'].astype(str) == complaint_id].copy()
        row_to_archive = row_to_archive.rename(columns={
            "Complaint": "Complaint",
            "Predicted Agency": "Agency",
            "Remark": "Remark"
        })
        row_to_archive = row_to_archive[["ID", "Name", "Complaint", "Location", "Agency", "Image ID", "Status", "Remark"]]
        row_to_archive["Feedback"] = feedback
        archive = pd.concat([archive, row_to_archive], ignore_index=True)

    archive_sheet.clear()

    archive_sheet.update(
        [archive.columns.values.tolist()] + archive.values.tolist()
    )

    return jsonify({"success": True, "message": "Feedback submitted"})

#-------------------------COMPLAINT LIST SCREEN BACKEND-------------------------

#Active Complaints
@app.route("/api/complaints")
def get_active_complaints():
    arranged_df = pd.DataFrame(arranged_sheet.get_all_records()).fillna('')

    #Filter UNSOLVED and UNDER REVIEW
    arranged_df = arranged_df[arranged_df["Status"].isin(["UNSOLVED", "UNDER REVIEW"])]

    return jsonify(arranged_df.to_dict(orient="records"))

#Archive Complaints
@app.route("/api/archive_complaints")
def get_archive_complaints():
    archive_df = pd.DataFrame(archive_sheet.get_all_records()).fillna('')

    #Filter SOLVED and SPAM
    archive_df = archive_df[archive_df["Status"].isin(["SOLVED", "SPAM"])]

    return jsonify(archive_df.to_dict(orient="records"))

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
Accounts = pd.DataFrame(accounts_sheet.get_all_records())
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400

    if not os.path.exists(Accounts):
        return jsonify({"success": False, "message": "Accounts database not found"}), 500

    accounts_df = pd.DataFrame(accounts_sheet.get_all_records())

    matched = accounts_df[
        (accounts_df['Username'].astype(str).str.strip() == username) &
        (accounts_df['Password'].astype(str).str.strip() == password)  
    ]

    if not matched.empty:
        return jsonify({"success": True, "message": "Login successful"})
    else:
        return jsonify({"success": False, "message": "Incorrect username or password"}), 401
    
#-------------------------NEW ACCOUNT BACKEND-------------------------
#For future: add hashlib for password hashing
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

    # Push back to Google Sheet
    accounts_sheet.clear()
    accounts_sheet.update([df.columns.values.tolist()] + df.values.tolist())

    return jsonify({"success": True, "message": "Admin account created"})


@app.route('/api/admins', methods=['GET'])
def get_admin_list():
    # Load accounts from Google Sheet
    df = pd.DataFrame(accounts_sheet.get_all_records())
    return jsonify(df.to_dict(orient="records"))

#-------------------------END POINT-------------------------

#Back and Front end connection:
if __name__ == '__main__':
    Main()  #Run once
    app.run(host="0.0.0.0", port=5000, debug=True)
