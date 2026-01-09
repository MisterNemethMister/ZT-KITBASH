# Cloudflare ZTNA Network Map

An interactive network visualization tool for managing Cloudflare Zero Trust Network Access (ZTNA) infrastructure, built following Object-Oriented UX (OOUX) methodology.

## Features

### OOUX Methodology
Each network component is represented as an **Object** with:
- **Attributes**: Properties that define the object (e.g., email, device ID, policy rules)
- **Relations**: Connections to other objects in the network
- **Calls-to-Action**: Available operations (e.g., authenticate, configure, monitor)

### Network Components

1. **User** - End users accessing resources through Cloudflare Access
2. **Device** - User devices with WARP client for secure connectivity
3. **Application** - Protected applications or resources behind Cloudflare Access
4. **Cloudflare Tunnel** - Secure tunnels connecting private resources to Cloudflare
5. **Access Policy** - Zero Trust policies controlling resource access
6. **Identity Provider** - IdP for user authentication (Okta, Azure AD, Google, etc.)
7. **Cloudflare Gateway** - Secure web gateway for DNS, HTTP, and network filtering
8. **Private Network** - Private network segments accessible through ZTNA
9. **Service Token** - Machine-to-machine authentication tokens

### CRUD Operations

- **Create**: Add new nodes to your network with full attribute configuration
- **Read**: View detailed information about any node including attributes, relations, and available actions
- **Update**: Edit node properties and configurations
- **Delete**: Remove nodes and their connections from the network

### Interactive Features

- **Drag & Drop**: Reposition nodes to organize your network layout
- **Zoom & Pan**: Navigate large network topologies easily
- **Mini Map**: Overview of entire network with quick navigation
- **Visual Connections**: Animated edges showing relationships between components
- **Export/Import**: Save and load network configurations as JSON

## Installation

```bash
npm install
```

## Usage

### Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

### Creating a Node

1. Click **"Create New Node"** in the sidebar
2. Select the node type from the dropdown
3. Enter a descriptive label
4. Fill in required attributes (marked with *)
5. Click **"Create Node"**

### Editing a Node

1. Click on any node in the canvas
2. View details in the sidebar
3. Click **"Edit Node"**
4. Update attributes as needed
5. Click **"Update Node"**

### Deleting a Node

1. Click on the node you want to delete
2. Click **"Delete Node"** in the sidebar
3. Confirm the deletion

### Creating Connections

1. Drag from the bottom handle of one node
2. Drop on the top handle of another node
3. The connection will be created automatically

### Exporting Your Network

1. Click the download icon in the toolbar
2. Your network will be saved as a JSON file

### Importing a Network

1. Click the upload icon in the toolbar
2. Select a previously exported JSON file
3. Your network will be loaded

## Technology Stack

- **React 18** - UI framework
- **ReactFlow** - Interactive node-based graph library
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

## OOUX Design Principles

This application follows OOUX methodology where each network component is treated as an object with:

1. **Core Objects**: 9 distinct node types representing Cloudflare ZTNA components
2. **Object Attributes**: Configurable properties specific to each object type
3. **Object Relations**: Defined relationships between objects (e.g., User authenticates via Identity Provider)
4. **Calls-to-Action**: Context-specific actions available for each object type

## Network Architecture Example

The default network includes:
- Admin User → authenticates via → Okta SSO
- Admin User → owns → MacBook Pro
- MacBook Pro → connects to → Cloudflare Gateway
- Gateway → routes through → Production Tunnel
- Access Policy → protects → Internal Dashboard
- Tunnel → connects → Private Network

## License

MIT
