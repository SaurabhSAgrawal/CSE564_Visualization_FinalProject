from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import re
import json

df = pd.read_csv("./data/merged_updated.csv")
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
    attrs_alcohol = attrs_num[-4:]
    for i in range(df.shape[0]):
        row = {attr: df[attr][i] for attr in ["Country"]+attrs_alcohol}
        alcohol_by_years[str(df["Year"][i])].append(row)
    return jsonify(alcohol_by_years)




# {score: {USA: {2010: 0, 2011: 1, 2012: 3, ...}}}
@app.route("/linechart", methods=['POST', 'GET'])
def linechart():
#     countries = df["Country"].unique().tolist()
#     attr_dict = {}
#     for attr in attrs_num:
#         country_dict = {}
#         for country in countries:
#             year_dict = {}
#             for year in years:
#                 temp = df.loc[(df["Country"] == country) & (df["Year"] == year)][attr]
#                 if temp.empty:
#                     continue
#                 year_dict[str(year)] = df.loc[(df["Country"] == country) & (df["Year"] == year)][attr].to_numpy()[0]
#             vals = [val for val in year_dict.values() if not isinstance(val, str)]
#             if len(vals) == 0:
#                 continue
#             min_val = min(vals); max_val = max(vals)
#             if max_val - min_val > 0:
#                 year_dict = {k: (v-min_val)/(max_val-min_val) for k, v in year_dict.items() if not isinstance(v, str)}
#             country_dict[country] = year_dict
#         attr_dict[attr] = country_dict
#

    # countries = df["Country"].unique().tolist()
    # attr_dict = {}
    # for attr in attrs_num:
    #     year_dict = {}
    #     for year in years:
    #         country_dict = {}
    #         for country in countries:
    #             temp = df.loc[(df["Country"] == country) & (df["Year"] == year)][attr]
    #             if temp.empty:
    #                 continue
    #             # year_dict[str(year)] = df.loc[(df["Country"] == country) & (df["Year"] == year)][attr].to_numpy()[0]
    #             country_dict[country] = df.loc[(df["Country"] == country) & (df["Year"] == year)][attr].to_numpy()[0]
    #         vals = [val for val in country_dict.values() if not isinstance(val, str)]
    #         if len(vals) == 0:
    #             continue
    #         min_val = min(vals); max_val = max(vals)
    #         if max_val - min_val > 0:
    #             country_dict = {k: (v-min_val)/(max_val-min_val) for k, v in country_dict.items() if not isinstance(v, str)}
    #         year_dict[str(year)] = country_dict
    #     attr_dict[attr] = year_dict

    with open("./data/line_data.json", "r") as f:
        attr_dict = json.load(f)
    return jsonify(attr_dict)
    # return attr_dict

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
