# WheelsKe - Vehicle Comparison Platform

### About
**WheelsKe Kenya** is a premier car comparison platform designed for the Kenyan market. The platform aggregates listings from verified dealers across Kenya, offering powerful comparison tools and market insights to help users make well-informed purchasing decisions.

---

### Features

- Real-time price comparison across verified dealers
- Detailed vehicle specifications and reviews
- Market value and trend analysis
- Import duty calculator for imported vehicles
- Maintenance cost estimation tools
- Verified dealer profiles
- Fully responsive and mobile-friendly design

---

### Technology Stack

- **Frontend**: Next.js
- **Database**: MySQL
- **Scraping Tools**: Puppeteer/Cheerio
- **Authentication**: NextAuth
- **Cloud Services**: AWS

---

### Getting Started

#### Prerequisites
Before running the application, ensure the following are installed:

- **Node.js** (v18 or later)
- **MySQL** (v8 or later)

---

#### Installation and Setup

1. **Clone the Repository**
   This will create a local copy of the project on your machine folder named `wheelske`.
      ```bash
      git clone https://github.com/Earl006/AutoScout-Kenya.git wheelske
      cd wheelske
      ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up MySQL Database**
    - Install MySQL if not already installed.  
      On Ubuntu:
      ```bash
      sudo apt update
      sudo apt install mysql-server
      ```
    - Log in to MySQL as the root user:
      ```bash
      mysql -u root -p
      ```
    - Create a new database:
      ```sql
      CREATE DATABASE wheelske;
      ```

4. **Configure Environment Variables**
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and update the `DATABASE_URL` with your MySQL connection details:
      ```
      DATABASE_URL="mysql://<user>:<password>@localhost:3306/wheelske?schema=public"
      ```
      Replace `<user>` and `<password>` with your MySQL username and password.

5. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   ```

6**Start the Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

---

### Contributing
We welcome contributions from the community! If you have ideas, suggestions, or want to report issues, please reach out or create a pull request.

📧 **Contact Us**: info@autoscoutkenya.com

---

### Developers
- **SteveTom** - [GitHub](https://github.com/Raccoon254)
- **Earljoe Kadima** - [GitHub](https://github.com/Earl006)
- **Maxwell Furaha** - [GitHub](https://github.com/Simply-Furaha)

---

### Sample Environment File
Here’s a reference for your `.env` file:
```
DATABASE_URL="mysql://root:password@localhost:3306/wheelske?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```