from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

cards = [
    {
        "id": str(uuid.uuid4()),
        "brand": "Amber Jar",
        "title": "Honey best",
        "desc": "nectar you wish to get",
        "img": "thumb.jpg",    
        "visible": True
    },
    {
        "id": str(uuid.uuid4()),
        "brand": "Pouch",
        "title": "Dried fruits",
        "desc": "healthy snack",
        "img": "thumb2.jpg",
        "visible": True
    }
]

@app.route("/api/cards", methods=["GET"])
def get_cards():
    return jsonify(cards)

@app.route("/api/cards", methods=["POST"])
def add_card():
    data = request.json
    new_card = {
        "id": str(uuid.uuid4()),
        "brand": data.get("brand", "New Brand"),
        "title": data.get("title", "New Title"),
        "desc": data.get("desc", ""),
        "img": data.get("img", ""),
        "visible": data.get("visible", True)
    }
    cards.append(new_card)
    return jsonify(new_card), 201

@app.route("/api/cards/<card_id>", methods=["PUT"])
def update_card(card_id):
    data = request.json
    for card in cards:
        if card["id"] == card_id:
            card.update(data)
            return jsonify(card)
    return jsonify({"error": "Card not found"}), 404

@app.route("/api/cards/<card_id>", methods=["DELETE"])
def delete_card(card_id):
    global cards
    cards = [c for c in cards if c["id"] != card_id]
    return jsonify({"message": "Card deleted"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)


@app.route('/api/data', methods=['GET'])
def get_data():
    data = {
        "message": "Hello this is api end point"
    }
    return jsonify(data)

if __name__ == "__main__":   
    app.run(host="0.0.0.0", debug=True)
