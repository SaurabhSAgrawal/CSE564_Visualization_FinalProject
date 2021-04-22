from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn import preprocessing
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances
import re

df = pd.read_csv("./data/merged.csv")
df.fillna("null", inplace=True)
attrs_total = df.columns.values.tolist()
attrs_num = attrs_total[2:]

app = Flask(__name__)
CORS(app)


@app.route("/", methods=['POST', 'GET'])
def index():
    return render_template('index.html')


@app.route("/scatterplot", methods=['POST', 'GET'])
def scatterplot():
    years = df["Year"].unique()
    data_by_years = {str(year): [] for year in years}

    for i in range(df.shape[0]):
        row = {attr: df[attr][i] for attr in ["Country"]+attrs_num}
        data_by_years[str(df["Year"][i])].append(row)
    return jsonify(data_by_years)


@app.route("/attributes", methods=['POST', 'GET'])
def attributes():
    return jsonify({"attributes": attrs_num})


# @app.route("/pcp", methods=['POST', 'GET'])
# def pcp():
#     X_stdDF = X_stdDF_pcp[X_stdDF_pcp.columns.values.tolist()]
#     years = X_stdDF["Year"].unique()
#     data_by_years = {str(year): [] for year in years}
#     for i in range(X_stdDF.shape[0]):
#         row = {attr: X_stdDF[attr][i] for attr in ["Country"]+attrs_num}
#         data_by_years[str(X_stdDF["Year"][i])].append(row)
#     return jsonify(data_by_years)
    # data = X_stdDF
    # data = json.dumps(data.to_dict(orient='records'), indent=2)
    # data = {'pcpData': data}
    # print(data)
    # return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
