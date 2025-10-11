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

#Connection:
load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure CSVFile directory exists
os.makedirs("CSVFile", exist_ok=True)

#BACKEND DEVELOPMENT ----------------------------------

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



#Flask-React Connect and Assign from ComplaintsFormScreen:
@app.route('/api/complaints', methods=['POST'])
def run_arrangement():

    #Distribute Data from ComplaintsFormScreen
    data = request.get_json()
    name = data.get('name')
    complaint = data.get('complaint')
    location = data.get('location')
    category = data.get('category')
    imageID = data.get('imageID')  

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
        'Location': str(location) if location else '',
        'Category': str(category) if category else '',
        'Image ID': str(imageID) if imageID else '',
    }
    Database = pd.concat([Database, pd.DataFrame([new_row])], ignore_index=True)

    #Save updated database and returns it
    Database.to_csv("CSVFile/ComplaintsData.csv", index=False, encoding='cp1252')
    Main()

    #Message to user if complaint submission is successful (used on SubmitComplaintScreen.js)
    return jsonify({
        "id": int(ID),
        "message": "Complaint submitted! Check your ID to track its status."
    })


#Training Model and Classification Algorithms:
def Main():
    #Datasets:
    Database = pd.read_csv("CSVFile/ComplaintsData.csv", encoding='cp1252')
    Training_Data = pd.read_csv("CSVFile/TrainingDataset.csv", encoding='cp1252')

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

    #Train the model for agency prediction
    AgencyModel = make_pipeline( 
        CountVectorizer(lowercase=True),
        MultinomialNB()
    )
    AgencyModel.fit(X_agency, y_agency)

    #Flagged Words:
    prioritizedWords = [
        "corruption", 
        "corrupt",
        "kurakot", 
        "kinurakot", 
        "kinorakot", 
        "kinukurakot", 
        "kinukorakot",
        "fraud", 
        "harassment", 
        "abuse", 
        "pang-aabuso", 
        "inaabuso", 
        "abuso",
        "pagsasamantala", 
        "sinasamantala", 
        "pagsasamantalahan", 
        "discrimination", 
        "diskriminasyon", 
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

    #False Complaints Detection (WIP)
    # Implement logic to detect and handle false complaints.
    # Detect Spam or repeated complaints.

    #Category (WIP)
    # Implement admin changes on complaints category

    #Location must be within Dasma only (WIP)

    #Final selected output to ArrangedData
    output = Database[[ 
        'ID', 'Name', 'Complaint', 'Location',
        'Anger Score', 'Fear Score', 'Joy Score', 'Neutral Score',
        'Sadness Score', 'Surprise Score',
        'Predicted Agency', 'Flagged Words', 'Image ID',
    ]]

    #Save and return file
    output.to_csv("CSVFile/ArrangedData.csv", index=False)
    return output


#Takes result from ArrangedData 
@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    try:
        df = pd.read_csv('CSVFile/ArrangedData.csv')
    except FileNotFoundError:
        df = Main()

    # Replace all NaN, NaT, and pd.NA values with None
    df = df.replace({pd.NA: None, pd.NaT: None, float('nan'): None})

    return jsonify(df.to_dict(orient='records')) 



#Back and Front end connection:
if __name__ == '__main__':
    Main()  #Run once
    app.run(host="0.0.0.0", port=5000, debug=True)
