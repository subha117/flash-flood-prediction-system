import re

with open("react-frontend/src/App.jsx", "r") as f:
    content = f.read()

import_statement = "import { LocationProvider } from './context/LocationContext';\n"
if "LocationProvider" not in content:
    content = import_statement + content

app_component = """function App() {
  return (
    <LocationProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LocationProvider>
  );
}"""

content = re.sub(r"function App\(\) \{[\s\S]*?return \([\s\S]*?BrowserRouter>[\s\S]*?\);[\s\S]*?\}", app_component, content)

with open("react-frontend/src/App.jsx", "w") as f:
    f.write(content)
