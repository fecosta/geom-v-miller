# Data Viz - GEOM

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

---

# Legacy

## About

Project based on GEOM research [website](https://github.com/PedroToL/GEOM)

## Data

### Final

```
name,iso,y,c,Circumstances,latest,var,Region,Approach1,Value,Measure,Approach,Perspective
```

### Filtered Final

```
iso,Value,name
```

## Pages
* App
* Index (Deprecated)
* About (Deprecated)
* Documentation (Deprecated)
* Global (Deprecated)
* Table (Deprecated)
* Country (Deprecated)

```py
def display_page(path):
    if path == "/":
        return index.layout
    if path == "/_about":
        return _about.layout
    if path == "/documentation":
        return documentation.layout
    if path == "/global":
        return _global.layout
    if path == "/_table":
        return _table.layout
    if path == "/country":
        return country.layout
```

## App

This page is based on [Our World In Data](https://ourworldindata.org/gender-ratio) and attempts to replicate the UX for the given datasets.


### Index

Data:
```py
df = pd.read_csv("./data/Processed/final.csv")

df_map = df[df["Circumstances"] == "all"].copy()
df_map = df_map[df_map["latest"] == 1].copy()
df_map = df_map[df_map["Perspective"] == 'Ex-Ante Random Forest'].copy()
df_map = df_map[df_map["Measure"] == 'Gini'].copy()
df_map = df_map[df_map["Approach"] == 'Absolute'].copy()
```

Graph:
Choropleth based on `df_map` (static data)

```py
fig_map = px.choropleth(df_map, locations="iso", color="Value", hover_name="name")

fig_map.update_layout(
      geo=dict(
        showframe=False,
        showcoastlines=False,
        showland=True, 
        landcolor="lightgray",
        projection_type='equirectangular'
      ),
      showlegend=False,  # Hide legend
      margin=dict(
        l=0,  # left margin
        r=0,  # right margin
        b=25,  # bottom margin
        t=25   # top margin
    )
  )

fig_map.update_geos(projection_scale=1.05, center={"lat": 20, "lon": 0}, scope="world")
```

Data processing options for the `df_map` used by the choropleth (Under a bad network Slow 3G both methods take this time for loading):
1. process `final.csv` (~2MB) on the fly and then use it as input for d3 (~2115.80 ms)
2. pre-process `final.csv` (~1KB) in static `filtered-final.csv` and use it as input for d3 (~42625.60 ms)

### Global

Data:
```py
df = pd.read_csv("./data/Processed/final.csv")
```
And filtered based on Measure, Perspective, Approach, Variable

Graphs:
* choropleth
* time series / scatter plot

### Table

### Global

This page contains the dashboard sidebar with initial world view, table and time series

### Country
