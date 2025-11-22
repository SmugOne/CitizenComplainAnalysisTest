from flask import Flask, jsonify, request
from flask_cors import CORS  
from dotenv import load_dotenv
import os
import pandas as pd
import joblib
import uuid
from oauth2client.service_account import ServiceAccountCredentials
from sklearn.preprocessing import PolynomialFeatures
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from werkzeug.utils import secure_filename
from transformers import pipeline
from collections import Counter


#To do:
# - Set dataset to Google Sheets. Get API.

#Connection:
load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure CSVFile directory exists
os.makedirs("CSVFile", exist_ok=True)

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
    Database = pd.read_csv("CSVFile/ComplaintsData.csv", encoding='cp1252')

    #Assign new ID based on the last one
    if Database.empty:
        ID = 1
    else:
        ID = Database['ID'].max() + 1

    #Add new entry to the database
    new_row = {
        'ID': ID,
        'Name': name,
        'Raw Complaint': complaint,
        'Location': str(location),
        'Category': str(category),
        'Image ID': str(imageID),
        'Status': str(status),
        'Password': str(password),
    }
    Database = pd.concat([Database, pd.DataFrame([new_row])], ignore_index=True)
    Database = Database.fillna('')

    #Save updated database and returns it
    Database.to_csv("CSVFile/ComplaintsData.csv", index=False, encoding='cp1252')
    Main()

    #Return ID to frontend. Do not remove
    return jsonify({"message": "Complaint submitted successfully", "ID": str(int(ID))})

#-------------------------MAIN ALGORITHM LIST BACKEND-------------------------

#Training Model and Classification Algorithms:
def Main():
    #Datasets:
    Database = pd.read_csv("CSVFile/ComplaintsData.csv", encoding='cp1252')
    Database = Database.fillna('')
    Training_Data = pd.read_csv("CSVFile/TrainingDataset.csv", encoding='cp1252')

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

    #Save and return file
    output.to_csv("CSVFile/ArrangedData.csv", index=False)
    return output

#-------------------------TRACK COMPLAINT BACKEND-------------------------

#Track Complaint Status from TrackComplaintScreen:
@app.route('/api/complaints/track/<complaint_id>', methods=['GET'])
def track_complaint(complaint_id):
    complaint_id = str(complaint_id).strip()
    
    #Load live complaints
    ArrangedData = pd.read_csv('CSVFile/ArrangedData.csv', encoding='cp1252').fillna('')
    found_live = ArrangedData[ArrangedData['ID'].astype(str) == complaint_id]

    if not found_live.empty:
        complaint_data = found_live.iloc[0].to_dict()
        status = complaint_data['Status'].upper()
        
        if status in ['UNSOLVED']:
            complaint_data['Remarks'] = ""
            return jsonify({"found": True, "complaint": complaint_data})
        
        #If SOLVED or SPAM, fetch archive for Remarks
        df_archive = pd.read_csv('CSVFile/Archive.csv', encoding='cp1252').fillna('')
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
        df = pd.read_csv('CSVFile/ArrangedData.csv')
    except FileNotFoundError:
        df = Main()
    category_labels = [
        "All",
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
    ]
    category_col = "Predicted Agency" if "Predicted Agency" in df.columns else "Category"
    status_col = "Status" if "Status" in df.columns else None

    #Count categories
    category_counts = Counter(df[category_col].dropna()) if category_col in df else Counter()

    #Count statuses exactly from the CSV (case-insensitive optional)
    status_counts = Counter(df[status_col].dropna()) if status_col and status_col in df else Counter()

    return jsonify({
        "categoryCounts": dict(category_counts),
        "statusCounts": dict(status_counts)
    })

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
    arranged_path = "CSVFile/ArrangedData.csv"
    arranged = pd.read_csv(arranged_path, encoding='cp1252')
    arranged.loc[arranged['ID'].astype(str) == complaint_id, ['Status', 'Predicted Agency']] = [status, agency]
    arranged.to_csv(arranged_path, index=False, encoding='cp1252')

    #Update ComplaintsData.csv (add Remark column if not exists)
    list_path = "CSVFile/ComplaintsData.csv"
    comp_list = pd.read_csv(list_path, encoding='cp1252')
    if "Remark" not in comp_list.columns:
        comp_list["Remark"] = ""
    comp_list.loc[comp_list['ID'].astype(str) == complaint_id, ['Status', 'Category', 'Remark']] = [status, agency, remark]
    comp_list.to_csv(list_path, index=False, encoding='cp1252')

    #Update Archive.csv
    archive_path = "CSVFile/Archive.csv"
    if status.upper() in ["SOLVED", "SPAM"]:
        archive = pd.read_csv(archive_path, encoding='cp1252') if os.path.exists(archive_path) else pd.DataFrame(columns=[ 
            "ID", "Name", "Complaint", "Location", "Agency", "Image ID", "Status", "Remark"
        ]) #If status is Solved or Spam, data is appended.

        row_to_archive = comp_list.loc[comp_list['ID'].astype(str) == complaint_id, [
            "ID", "Name", "Raw Complaint", "Location", "Category", "Image ID", "Status", "Remark"
        ]].copy()

        #Rename columns for Archive
        row_to_archive = row_to_archive.rename(columns={
            "Raw Complaint": "Complaint",
            "Category": "Agency",
            "Remark": "Remark",
        })

        #Append
        archive = pd.concat([archive, row_to_archive], ignore_index=True)
        archive.to_csv(archive_path, index=False, encoding='cp1252')

    return jsonify({"success": True})

#-------------------------FEEDBACK BACKEND-------------------------

@app.route("/api/complaints/feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()
    complaint_id = str(data.get("ID", "")).strip()
    feedback = data.get("Feedback", "").strip()

    if not complaint_id or not feedback:
        return jsonify({"success": False, "message": "Missing ID or feedback"})

    arranged_path = "CSVFile/ArrangedData.csv"
    arranged = pd.read_csv(arranged_path, encoding='cp1252').fillna('')

    # Check if complaint exists in ArrangedData
    if complaint_id not in arranged['ID'].astype(str).values:
        return jsonify({"success": False, "message": "Complaint ID not found"})

    # Load Archive
    archive_path = "CSVFile/Archive.csv"
    archive = pd.read_csv(archive_path, encoding='cp1252').fillna('') if os.path.exists(archive_path) else pd.DataFrame(columns=[
        "ID", "Name", "Complaint", "Location", "Agency", "Image ID", "Status", "Remark", "Feedback"
    ])

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
        row_to_archive = arranged.loc[arranged['ID'].astype(str) == complaint_id].copy()
        row_to_archive = row_to_archive.rename(columns={
            "Complaint": "Complaint",
            "Predicted Agency": "Agency",
            "Remark": "Remark"
        })
        row_to_archive = row_to_archive[["ID", "Name", "Complaint", "Location", "Agency", "Image ID", "Status", "Remark"]]
        row_to_archive["Feedback"] = feedback
        archive = pd.concat([archive, row_to_archive], ignore_index=True)

    archive.to_csv(archive_path, index=False, encoding='cp1252')

    return jsonify({"success": True, "message": "Feedback submitted"})

#-------------------------COMPLAINT LIST SCREEN BACKEND-------------------------

@app.route("/api/complaints")
def get_active_complaints():
    df = df[df["Status"].isin(["UNSOLVED", "UNDER REVIEW"])]
    path = "CSVFile/ArrangedData.csv"
    if os.path.exists(path):
        df = pd.read_csv(path, encoding='cp1252').fillna('')
    else:
        df = pd.DataFrame(columns=[
            "ID", "Name", "Raw Complaint", "Location",
            "Category", "Image ID", "Status", "Password", "Remark"
        ])
    df = df[df["Status"].isin(["UNSOLVED", "UNDER REVIEW"])]
    return jsonify(df.to_dict(orient="records"))

@app.route("/api/archive_complaints")
def get_archive_complaints():
    path = "CSVFile/Archive.csv"
    if os.path.exists(path):
        df = pd.read_csv(path, encoding='cp1252').fillna('')
    else:
        df = pd.DataFrame(columns=[
            "ID", "Name", "Complaint", "Location",
            "Agency", "Image ID", "Status", "Remark", "Feedback"
        ])
    df = df[df["Status"].isin(["SOLVED", "SPAM"])]
    return jsonify(df.to_dict(orient="records"))

#-------------------------Announcement Edit Backend-------------------------

#Shows announcements
@app.route('/api/announcements', methods=['GET'])
def get_announcements():
    ar = pd.read_csv("CSVFile/Announcements.csv", encoding='cp1252')

    #Clean and convert types
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

    ar = pd.read_csv("CSVFile/Announcements.csv", encoding='cp1252')

    ar['Space'] = pd.to_numeric(ar['Space'], errors='coerce').fillna(0).astype(int)

    if space in ar['Space'].values:
        ar.loc[ar['Space'] == space, ['Title', 'Body']] = [title, body]
    else:
        new_row = {"Space": space, "Title": title, "Body": body}
        ar = pd.concat([ar, pd.DataFrame([new_row])], ignore_index=True)

    ar = ar.sort_values(by='Space').reset_index(drop=True)
    ar.to_csv("CSVFile/Announcements.csv", index=False, encoding='cp1252')

    return jsonify({"message": "Announcement updated"}), 200

#-------------------------ACCOUNT LOGIN BACKEND-------------------------
Accounts = "CSVFile/Accounts.csv"
#Optional for the future: hashlib for password hashing
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400

    if not os.path.exists(Accounts):
        return jsonify({"success": False, "message": "Accounts database not found"}), 500

    accounts_df = pd.read_csv(Accounts, encoding='cp1252').fillna('')

    matched = accounts_df[
        (accounts_df['Username'].astype(str).str.strip() == username) &
        (accounts_df['Password'].astype(str).str.strip() == password)  
    ]

    if not matched.empty:
        return jsonify({"success": True, "message": "Login successful"})
    else:
        return jsonify({"success": False, "message": "Incorrect username or password"}), 401
    
#-------------------------NEW ACCOUNT BACKEND-------------------------

Accounts = "CSVFile/Accounts.csv"

@app.route('/api/admin/create_account', methods=['POST'])
def get_admins():
    #Return all admin users
    if os.path.exists(Accounts):
        df = pd.read_csv(Accounts, encoding='cp1252').fillna('')
    else:
        df = pd.DataFrame(columns=["Username", "Password", "Full Name", "Email",])

@app.route('/api/admins', methods=['POST'])
def create_admin():
    data = request.get_json()
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()

    # Validation
    if not username or not password or not name:
        return jsonify({"success": False, "message": "Username, password, and name are required"}), 400

    #Load or create Accounts.csv
    if os.path.exists(Accounts):
        df = pd.read_csv(Accounts, encoding='cp1252').fillna('')
    else:
        df = pd.DataFrame(columns=["Username", "Password", "Full Name", "Email",])

    #Check for duplicate username
    if username in df['Username'].astype(str).str.strip().values:
        return jsonify({"success": False, "message": "Username already exists"}), 400

    #Add new admin
    new_row = {
        "Username": username,
        "Password": password,  
        "Email": email,
    }
    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv(Accounts, index=False, encoding='cp1252')

    return jsonify({"success": True, "message": "Admin created successfully"})
#-------------------------END POINT-------------------------

#Back and Front end connection:
if __name__ == '__main__':
    Main()  #Run once
    app.run(host="0.0.0.0", port=5000, debug=True)
