# RAG Chatbot - AI-Powered Document Q&A System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue)](https://www.python.org/)

An enterprise-grade Retrieval-Augmented Generation (RAG) chatbot that enables intelligent document question-answering with advanced features.

## ✨ Features

- 🤖 **Advanced RAG System** - Hybrid search with BM25 + semantic similarity
- 📄 **Multi-Format Support** - PDF, TXT, DOCX, and more
- 💬 **Persistent Chat History** - Save and search past conversations
- 🎨 **Modern UI** - Dark/Light themes with responsive design
- 🔐 **Secure Authentication** - JWT-based user management
- 🔍 **Smart Search** - Semantic reranking for better results
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- ⚡ **Real-time Processing** - Streaming responses with typing indicators

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### Backend
- **Framework:** FastAPI (Python)
- **Vector DB:** ChromaDB
- **Search:** BM25 + Sentence Transformers
- **LLM:** OpenRouter API
- **Auth:** JWT with Argon2 hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- OpenRouter API key

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/rag-chatbot.git
cd rag-chatbot
```

**2. Setup Backend**
```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your OPENROUTER_API_KEY

# Run backend
uvicorn main:app --reload
```

**3. Setup Frontend**
```bash
cd frontend
npm install

# Create .env.local
cp .env.example .env.local

# Run frontend
npm run dev
```

**4. Open app**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🌐 Deployment

See [deployment_guide.md](./deployment_guide.md) for detailed deployment instructions.

**Recommended Platforms:**
- **Frontend:** Vercel (Free)
- **Backend:** Railway or Render (Free tier available)

## 📖 API Documentation

Visit `/docs` on your backend URL for interactive API documentation.

## 🎯 Use Cases

- 📚 Research document analysis
- 📋 Legal document Q&A
- 📊 Business report insights
- 📖 Educational material assistance
- 🏢 Enterprise knowledge base

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
OPENROUTER_API_KEY=your_api_key
SECRET_KEY=your_jwt_secret
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**
- GitHub: [@WaseemMohd123](https://github.com/WaseemMohd123)
- LinkedIn: [waslinked](https://linkedin.com/in/waslinked)

## 🙏 Acknowledgments

- OpenRouter for LLM API
- ChromaDB for vector storage
- FastAPI community
- Next.js team

---

⭐ Star this repo if you find it helpful!
