# Clinic Onboarding Server

A robust Node.js/Express backend API for medical clinic onboarding forms with MongoDB and Cloudinary integration.

## Features

- 🏥 Complete medical clinic onboarding workflow
- 📁 File upload with Cloudinary integration
- 🗃️ MongoDB database with comprehensive schema
- ✅ Input validation and sanitization
- 🔒 Security middleware (CORS, Helmet, Rate limiting)
- 📊 Admin dashboard with statistics
- 🌐 Arabic language support
- 📱 RESTful API design

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Validation**: Express-validator
- **Security**: CORS, Helmet, Rate limiting
- **File Upload**: Multer with Cloudinary storage

## Installation

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   - Copy `.env.example` to `.env`
   - Update the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/clinic-onboarding
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=921443381915416
   CLOUDINARY_API_SECRET=pcvh7F5vK2jDA96spZ00lAwmKgQ
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Submissions

- **POST** `/api/submissions` - Submit new clinic onboarding form
- **GET** `/api/submissions` - Get all submissions (with filtering & pagination)
- **GET** `/api/submissions/:id` - Get single submission
- **PUT** `/api/submissions/:id/status` - Update submission status
- **DELETE** `/api/submissions/:id` - Delete submission
- **GET** `/api/submissions/stats/overview` - Get submission statistics

### Health Check

- **GET** `/api/health` - Server health status

## Data Schema

### Required Fields
- `clinicName`: Clinic name
- `doctorName`: Doctor's full name
- `specialty`: Medical specialty
- `phoneNumber`: Lebanese phone format
- `clinicAddress`: Detailed clinic address
- `googleMapsLink`: Google Maps URL
- `workingHours`: Operating hours
- `gmailAccount`: Gmail account for clinic
- `gmailPassword`: Gmail password
- `filmingDay`: Weekly filming day
- `contentApprover`: Content approval contact
- `platformAccessAgreement`: Social media platform agreement
- `pricingFile`: Pricing document (Cloudinary URL)
- `gmbCategory`: Google My Business category
- `logo`: Clinic logo (Cloudinary URL)
- `acceptPaidAds`: Paid ads management agreement
- `confirmInfo`: Information confirmation
- `agreeTerms`: Terms agreement

### Optional Fields
- `clinicServices`: Description of services
- `doctorBio`: Doctor's biography
- `doctorPhotos`: Array of doctor photos
- `primaryColor`, `secondaryColor`, `accentColor`, `textColor`: Brand colors
- `languages`: Supported languages
- `frontDeskPhoto`, `waitingRoomPhoto`, `signagePhoto`: Clinic photos

### System Fields
- `status`: Submission status (قيد المراجعة, مُعتمد, مرفوض)
- `submissionDate`: Submission timestamp
- `lastUpdated`: Last update timestamp
- `completionPercentage`: Calculated completion percentage

## File Upload

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF (max 5MB)
- **Documents**: PDF, DOC, DOCX, XLS, XLSX (max 10MB)

### Cloudinary Organization
```
clinic-submissions/
├── [submissionId]/
│   ├── logos/
│   ├── pricing/
│   ├── doctors/
│   └── clinic-photos/
```

## Validation

### Phone Number
- Lebanese format: `+961XXXXXXXX` or `961XXXXXXXX` or `XXXXXXXX`
- 8 digits after country code

### Email
- Must be valid Gmail address (`@gmail.com`)

### Google Maps
- Must be valid Google Maps URL format

### Colors
- Hex color format (`#RRGGBB` or `#RGB`)

## Error Handling

The API provides comprehensive error handling with Arabic messages:

- **400**: Validation errors
- **404**: Resource not found
- **500**: Server errors

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Sanitization**: XSS protection
- **File Upload Limits**: Size and type restrictions

## Development

```bash
# Install dependencies
npm install

# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `NODE_ENV` | Environment mode | No (default: development) |

## Usage Examples

### Submit New Clinic
```javascript
const formData = new FormData();
formData.append('clinicName', 'عيادة الدكتور أحمد');
formData.append('doctorName', 'د. أحمد محمد');
formData.append('specialty', 'dentist');
formData.append('logo', logoFile);
formData.append('pricingFile', pricingFile);
// ... other fields

const response = await fetch('/api/submissions', {
  method: 'POST',
  body: formData
});
```

### Get All Submissions
```javascript
const response = await fetch('/api/submissions?page=1&limit=10&status=قيد المراجعة');
```

### Update Status
```javascript
const response = await fetch('/api/submissions/123/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'مُعتمد' })
});
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

ISC License
