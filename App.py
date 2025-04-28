from flask import Flask, render_template, request, jsonify
import numpy as np
import pickle

# Initialize Flask
app = Flask(__name__)

# Load the updated models
credit_card_model = pickle.load(open('credit_card_model.sav', 'rb'))
online_payment_model = pickle.load(open('online_payment_model.sav', 'rb'))

# Home page route
@app.route('/')
def home():
    return render_template('index.html')

# Predict credit card fraud
@app.route('/predict_credit_card', methods=['POST'])
def predict_credit_card():
    try:
        # Get form inputs
        features = [float(request.form[f'v{i}']) for i in range(1, 29)]  # lowercase 'v' like in HTML form
        amount = float(request.form['amount'])
        features.append(amount)

        # Prediction
        prediction = credit_card_model.predict(np.array(features).reshape(1, -1))
        is_fraud = bool(prediction[0])

        # Dummy confidence score (if model does not provide)
        confidence = 95

        return jsonify({
            'isFraud': is_fraud,
            'amount': amount,
            'confidence': confidence,
            'message': 'Credit card fraud analysis complete.',
            'top_features': [
                {'name': f'V{i}', 'value': features[i-1]} for i in range(1, 6)
            ]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Predict online payment fraud
@app.route('/predict_online_payment', methods=['POST'])
def predict_online_payment():
    try:
        print("Received form data:", request.form)

        type_mapping = {
            'CASH_OUT': 0,
            'PAYMENT': 1,
            'CASH_IN': 2,
            'TRANSFER': 3,
            'DEBIT': 4
        }

        type_encoded = type_mapping.get(request.form['type'], -1)
        amount = float(request.form['amount'])
        old_balance = float(request.form['oldbalanceOrg'])
        new_balance = float(request.form['newbalanceOrig'])

        errorBalanceOrig = old_balance - amount - new_balance
        errorBalanceDest = new_balance + amount - old_balance

        features = [type_encoded, amount, old_balance, new_balance, errorBalanceOrig, errorBalanceDest]
        features = np.array(features).reshape(1, -1)


        prediction = online_payment_model.predict(np.array(features).reshape(1, -1))
        is_fraud = bool(prediction[0])

        confidence = 90

        return jsonify({
            'isFraud': is_fraud,
            'amount': amount,
            'oldbalanceOrg': old_balance,
            'newbalanceOrig': new_balance,
            'confidence': confidence,
            'message': 'Online payment fraud analysis complete.'
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)