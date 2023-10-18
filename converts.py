from flask import Flask, render_template, request
import pandas as pd
import numpy as np
import pickle
import warnings

app = Flask(__name__, template_folder='public')
warnings.filterwarnings("ignore", message="Trying to unpickle estimator")

def load_model(modelfile):
    loaded_model = pickle.load(open(modelfile, 'rb'))
    return loaded_model

@app.route('/')
def index():
    return render_template('indexed.html')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        N = float(request.form['nitrogen'])
        P = float(request.form['phosphorus'])
        K = float(request.form['potassium'])
        temp = float(request.form['temperature'])
        humidity = float(request.form['humidity'])
        ph = float(request.form['ph'])
        rainfall = float(request.form['rainfall'])

        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)

        loaded_model = load_model('C:/Users/anush/bharath intern/group/model (3).pkl')  # Update the path to your model file
        prediction = loaded_model.predict(single_pred)

        # Convert the prediction to a string before using title()
        prediction_str = str(prediction)

        return render_template('indexed.html', prediction=prediction_str.title())

if __name__ == '__main__':
    app.run(debug=True)
