# TariffAgent 🇦🇪

**AI-Powered HS Code Classification for UAE Customs & Trade Compliance**

TariffAgent is an intelligent web application that automates HS (Harmonized System) code classification for UAE imports using Google Gemini AI. It helps importers quickly classify goods, calculate CEPA duty savings, identify prohibited items, and generate compliance reports.

## 🌟 Features

### Core Functionality
- **AI-Powered Classification**: Uses Google Gemini 2.5 Pro to accurately classify items based on descriptions
- **CEPA Savings Calculator**: Automatically calculates duty savings for India-origin goods under the Comprehensive Economic Partnership Agreement
- **Prohibited Item Detection**: Identifies restricted and prohibited items to prevent customs rejections
- **Invoice Processing**: Supports both single item and full invoice classification
- **Multi-Format Support**: Upload PDFs, images (JPEG, PNG, WebP, GIF), or paste text directly
- **Bilingual Interface**: Full support for English and Arabic with RTL layout
- **Compliance Reports**: Generates professional PDF reports with required documents and duty calculations

### Advanced Features
- **Smart Text Extraction**: AI-powered extraction from PDFs and images with automatic formatting
- **Metadata Extraction**: Automatically detects country of origin and CIF value from documents
- **Semantic Search**: Optimized text processing for better LLM understanding and classification
- **Real-time Processing**: Get classification results in under 10 seconds
- **Export Capabilities**: Download detailed PDF reports for customs submission

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gauravbhatia4601/TariffAgent.git
   cd TariffAgent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash-exp
   GEMINI_TEMPERATURE=0.1
   GEMINI_MAX_TOKENS=2048
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Single Item Classification
1. Enter item description (English or Arabic)
2. Select country of origin
3. Enter CIF value (optional, for duty calculation)
4. Click "Classify & Calculate"
5. View HS code, duty rates, CEPA savings, and required documents

### Invoice Classification
1. Upload PDF invoice or image, or paste invoice text
2. Select country of origin (auto-detected if available)
3. System extracts line items automatically
4. Get classification for all items with total savings
5. Download comprehensive PDF report

### File Upload
- **Supported formats**: PDF, JPEG, PNG, WebP, GIF, TXT
- **Max file size**: 10MB per file
- **Features**: 
  - Automatic text extraction
  - Country and CIF value detection
  - Human-readable formatting
  - Multi-file support

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI/ML**: Google Gemini 2.5 Pro
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **PDF Generation**: @react-pdf/renderer
- **PDF Parsing**: pdf-parse
- **Search**: Fuse.js

## 📁 Project Structure

```
tariffGPT/
├── app/
│   ├── api/              # API routes
│   │   ├── classify/     # Single item classification
│   │   ├── classify-invoice/  # Invoice classification
│   │   ├── extract-text/      # PDF/image text extraction
│   │   ├── generate-pdf/      # PDF report generation
│   │   └── health/            # Health check endpoint
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── classification/   # Classification UI components
│   ├── layout/           # Header, Sidebar, Language switcher
│   ├── pdf/              # PDF report components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── ai/               # AI classification logic
│   ├── data/             # Tariff data and search
│   ├── store/            # Zustand state management
│   └── utils/            # Utilities and translations
├── data/                 # Static data files (CEPA, tariff, prohibited items)
└── public/               # Public assets
```

## 🔧 API Endpoints

- `POST /api/classify` - Classify a single item
- `POST /api/classify-invoice` - Classify all items in an invoice
- `POST /api/extract-text` - Extract text from PDF/image
- `POST /api/generate-pdf` - Generate compliance report PDF
- `GET /api/health` - System health check

## 🌍 Supported Countries

- **India** (CEPA eligible - automatic duty savings calculation)
- **China**
- **UAE**
- **United States**
- **United Kingdom**
- **Other** (standard duty rates)

## 📊 What Problem Does It Solve?

1. **Time Savings**: Processes invoices in seconds instead of hours of manual classification
2. **Error Reduction**: Minimizes classification errors that lead to delays and penalties
3. **Cost Optimization**: Identifies CEPA savings opportunities (AED 500-5000 per shipment)
4. **Compliance**: Prevents customs rejections by identifying prohibited/restricted items
5. **Documentation**: Generates complete compliance reports with required documents
6. **Accessibility**: Bilingual support (English/Arabic) for UAE importers

## 🚢 Deployment

### Vercel (Recommended)
The project is configured for easy deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables (GEMINI_API_KEY)
4. Deploy!

**Production URL**: https://tariffagent-qqq8qw4ax-techniozs-projects.vercel.app

### Manual Deployment
```bash
npm run build
npm start
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `GEMINI_MODEL` | Gemini model to use | No | `gemini-2.0-flash-exp` |
| `GEMINI_TEMPERATURE` | AI temperature setting | No | `0.1` |
| `GEMINI_MAX_TOKENS` | Max output tokens | No | `2048` |

## ⚠️ Legal Disclaimer

**For reference only.** Final classification authority rests with UAE Customs (FCA). Always verify with official sources before submission. Data current as of November 2025.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Enhanced multi-language support
- [ ] Batch processing for multiple invoices
- [ ] Integration with UAE customs systems
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Historical classification tracking

---

**Built with trust for UAE Importers**

*Powered by Google Gemini 2.5 Pro 🤖*
