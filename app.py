from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import re
from flask import request
import json

df = pd.read_csv("./data/merged_updated.csv")
df_pie = pd.read_csv("./data/merged_updated.csv")
df_pie.fillna(0, inplace=True)
df.fillna("null", inplace=True)
attrs_total = df.columns.values.tolist()
attrs_num = attrs_total[2:]
years = df["Year"].unique()

app = Flask(__name__)
CORS(app)


@app.route("/", methods=['POST', 'GET'])
def index():
    return render_template('index.html')


@app.route("/scatterplot", methods=['POST', 'GET'])
def scatterplot():
    data_by_years = {str(year): [] for year in years}

    for i in range(df.shape[0]):
        row = {attr: df[attr][i] for attr in ["Country"]+attrs_num}
        data_by_years[str(df["Year"][i])].append(row)
    return jsonify(data_by_years)


@app.route("/attributes", methods=['POST', 'GET'])
def attributes():
    return jsonify({"attributes": attrs_num})


@app.route("/barchart", methods=['POST', 'GET'])
def barchart():
    alcohol_by_years = {str(year): [] for year in years}
    attrs_alcohol = attrs_num[-5:-1]
    for i in range(df.shape[0]):
        row = {attr: df[attr][i] for attr in ["Country"]+attrs_alcohol}
        alcohol_by_years[str(df["Year"][i])].append(row)
    return jsonify(alcohol_by_years)


@app.route("/piechart", methods=['POST', 'GET'])
def piechart():
    year = request.form['year']
    selected_countries = request.form.getlist('countrylist[]')
    selected_country = request.form['country']
    result = df_pie[df_pie['Year'] == int(year)]
    if(len(selected_countries) > 0 or (selected_country != "none" and len(selected_country) > 0)):
        result = result[(result['Country'].isin(selected_countries)) | (
            result['Country'] == selected_country)]
    # print(result)
    pos = result['Positive_affect'].sum(skipna=True)
    neg = result['Negative_affect'].sum(skipna=True)
    pos_percentage = pos * 100 / (pos + neg + 0.0000001)
    pos_percentage = round(pos_percentage, 2)
    neg_percentage = neg * 100 / (pos + neg + 0.0000001)
    neg_percentage = round(neg_percentage, 2)
    data = [{"name": "Positive Affect", "value": pos_percentage},
            {"name": "Negative Affect", "value": neg_percentage}]
    return jsonify(data)

# {score: {USA: {2010: 0, 2011: 1, 2012: 3, ...}}}


@app.route("/linechart", methods=['POST', 'GET'])
def linechart():
    with open("./data/line_data.json", "r") as f:
        attr_dict = json.load(f)
    return jsonify(attr_dict)
    # return attr_dict


if __name__ == "__main__":
    app.run(debug=True)
