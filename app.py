from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn import preprocessing
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances
import re

df = pd.read_csv("./data/merged.csv")

attrs_total = df.columns.values.tolist()
attrs_num = attrs_total[2:]
# print("all attrs:", attrs_total)
# print("num attrs:", attrs_num)

# happiness = pd.read_csv("./data/happiness.csv")
# h_countries = happiness["Country"].unique().tolist()
# alcohol = pd.read_csv("./data/alcohol.csv")
# a_countries = alcohol["Country"].unique().tolist()
# h_minus_a = sorted(set(h_countries).difference(set(a_countries)))
# a_minus_h = sorted(set(a_countries).difference(set(h_countries)))
# for c in a_minus_h:
#     print(c)
# print()
# for c in h_minus_a:
#     print(c)

### COLLECT BY YEAR

# years = df["Year"].unique()
# data_by_years = {year:[] for year in years}
#
# for i in range(df.shape[0]):
#     row = {attr: df[attr][i] for attr in ["Country"]+attrs_num}
#     data_by_years[df["Year"][i]].append(row)
# print(data_by_years)

app = Flask(__name__)
CORS(app)




@app.route("/", methods=['POST', 'GET'])
def index():
    return render_template('index.html')




if __name__ == "__main__":
    app.run(debug=True)



@app.route("/scatterplot")
def scatterplot():
    years = df["Year"].unique()
    data_by_years = {year:[] for year in years}

    for i in range(df.shape[0]):
        row = {attr: df[attr][i] for attr in ["Country"]+attrs_num}
        data_by_years[df["Year"][i]].append(row)
    print(data_by_years)
    return jsonify(data_by_years)
