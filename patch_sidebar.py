import re

with open("react-frontend/src/components/Sidebar/Sidebar.jsx", "r") as f:
    content = f.read()

# Add Context import if not exists
if "LocationContext" not in content:
    content = "import { LocationContext } from '../../context/LocationContext';\nimport { useContext } from 'react';\n" + content

# Inject context hook
content = re.sub(
    r"function Sidebar\(\{.*?\}\) \{",
    "function Sidebar({ activePage, onNavigate }) {\n  const { location } = useContext(LocationContext);",
    content
)

# Replace "Tehri, Uttarakhand"
content = content.replace("Tehri, Uttarakhand", "{location.name}, {location.state}")

with open("react-frontend/src/components/Sidebar/Sidebar.jsx", "w") as f:
    f.write(content)
