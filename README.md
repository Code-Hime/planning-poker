# Planning Poker 🃏

A modern, real-time planning poker application built with Nuxt 3, Vue 3, and Socket.IO. Perfect for agile teams to estimate story points collaboratively during sprint planning sessions.

## ✨ Features

### 🎯 Core Functionality

- **Real-time Collaboration**: Multiple team members can join the same room and vote simultaneously
- **Customizable Voting Options**: Choose from standard Fibonacci sequence (0, 1, 2, 3, 5, 8, 13) or include higher numbers (21, 34, 55, 89)
- **Special Cards**: Include question mark (?), coffee break (☕), and infinity (∞) options
- **Spectator Mode**: Join as a spectator to observe without voting
- **Story Management**: Set and update current stories or tasks being estimated
- **Vote Reveal**: Reveal all votes simultaneously for team discussion
- **Vote Reset**: Clear votes to start a new estimation round

### 🎨 User Experience

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Live Updates**: Real-time synchronization across all connected users
- **Touch-Friendly**: Large, easy-to-tap voting cards on mobile devices
- **Visual Feedback**: Clear indication of voting status and results

### 🔧 Technical Features

- **TypeScript**: Full type safety throughout the application
- **Real-time Communication**: Socket.IO for instant updates
- **State Management**: Pinia for reactive state management
- **Server-Side Rendering**: SEO-friendly with Nuxt 3
- **Progressive Web App**: Fast loading and offline capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd planning-poker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

The application will start both the Nuxt frontend (port 3000) and the Socket.IO server (port 3001) automatically.

## 🏗️ Project Structure

```
planning-poker/
├── assets/
│   └── styles/
│       └── main.scss          # Global styles and design system
├── composables/
│   └── useSocket.ts           # Socket.IO connection management
├── pages/
│   ├── index.vue              # Home page with room creation/joining
│   └── room/
│       └── [id].vue           # Dynamic room page
├── server/
│   └── plugins/
│       └── socket.ts          # Socket.IO server implementation
├── stores/
│   └── room.ts                # Pinia store for room state
├── types/
│   └── poker.ts               # TypeScript type definitions
├── app.vue                    # Root component
├── nuxt.config.ts             # Nuxt configuration
└── package.json
```

## 🎮 How to Use

### Creating a Room

1. Enter your name on the home page
2. Click "Create Room" to generate a random room code
3. Optionally click "Room Settings" to customize voting options:
   - Include higher numbers (21, 34, 55, 89)
   - Include question mark (?)
   - Include coffee break (☕)
   - Include infinity (∞)
4. Share the room code with your team

### Joining a Room

1. Enter your name and the room code
2. Choose whether to join as a spectator
3. Click "Join Room"

### Voting Process

1. **Set the Story**: Enter the story or task being estimated
2. **Cast Votes**: Click on your preferred story point value
3. **Wait for Everyone**: See who has voted and who hasn't
4. **Reveal Votes**: Once everyone has voted, reveal all votes
5. **Discuss**: Review the results and discuss any discrepancies
6. **Reset**: Clear votes to estimate the next story

## 🛠️ Technology Stack

### Frontend

- **Nuxt 3**: Full-stack Vue framework
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Type-safe JavaScript
- **Pinia**: State management
- **SCSS**: CSS preprocessing
- **@nuxt/icon**: Icon management

### Backend

- **Socket.IO**: Real-time bidirectional communication
- **Nitro**: Nuxt's server engine

### Development

- **Vite**: Fast build tool
- **ESLint**: Code linting
- **Sass**: CSS preprocessing

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

### Customization

- **Voting Options**: Modify the default options in `pages/room/[id].vue`
- **Styling**: Update colors and themes in `assets/styles/main.scss`
- **Socket Events**: Extend functionality in `server/plugins/socket.ts`

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel/Netlify

The application can be deployed to any platform that supports Node.js applications. The Socket.IO server will run alongside the Nuxt application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Nuxt 3](https://nuxt.com/)
- Real-time functionality powered by [Socket.IO](https://socket.io/)
- Icons provided by [Material Design Icons](https://materialdesignicons.com/)
- Inspired by agile planning poker methodology

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

**Happy Planning! 🎯**
