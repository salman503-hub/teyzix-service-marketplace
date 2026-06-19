from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import ProviderProfile
from listings.models import Listing
from requests.models import ServiceRequest
from projects.models import Project
from reviews.models import Review
from django.utils import timezone
from decimal import Decimal
import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with sample service marketplace data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')
        
        # 1. Clear existing database
        Review.objects.all().delete()
        Project.objects.all().delete()
        ServiceRequest.objects.all().delete()
        Listing.objects.all().delete()
        ProviderProfile.objects.all().delete()
        User.objects.all().delete()
        
        self.stdout.write('Database cleared.')

        # 2. Create Users
        # Admin
        admin_user = User.objects.create_superuser(
            username='admin_root',
            email='admin@marketplace.com',
            password='adminpassword123',
            phone='1234567890'
        )
        self.stdout.write('Superuser admin_root created.')

        # 5 Customers
        alex_cust = User.objects.create_user(
            username='alex_customer',
            email='alex@customer.com',
            password='password123',
            role='customer',
            phone='0987654321'
        )
        sarah_cust = User.objects.create_user(
            username='sarah_customer',
            email='sarah@customer.com',
            password='password123',
            role='customer',
            phone='1122334455'
        )
        john_cust = User.objects.create_user(
            username='john_customer',
            email='john@customer.com',
            password='password123',
            role='customer',
            phone='3344556677'
        )
        emma_cust = User.objects.create_user(
            username='emma_customer',
            email='emma@customer.com',
            password='password123',
            role='customer',
            phone='5566778899'
        )
        david_cust = User.objects.create_user(
            username='david_customer',
            email='david@customer.com',
            password='password123',
            role='customer',
            phone='7788990011'
        )
        self.stdout.write('5 Customers created.')

        # 5 Service Providers
        dev_prov = User.objects.create_user(
            username='dev_developer',
            email='dev@provider.com',
            password='password123',
            role='provider',
            phone='5544332211'
        )
        dev_profile = ProviderProfile.objects.create(
            user=dev_prov,
            bio='Expert Full Stack Web Developer specializing in React, Django, and modern cloud deployment. I build highly responsive and premium web applications.',
            skills=['React', 'Django', 'Tailwind CSS', 'PostgreSQL', 'Docker', 'REST APIs'],
            experience='5 years as a senior software consultant.',
            hourly_rate=Decimal('50.00'),
            portfolio_items=[
                {"title": "E-Commerce Application", "description": "High performance online store", "link": "https://example.com/shop"},
                {"title": "Real-time Dashboard", "description": "SaaS analytics chart board", "link": "https://example.com/charts"}
            ]
        )

        design_prov = User.objects.create_user(
            username='design_creative',
            email='design@provider.com',
            password='password123',
            role='provider',
            phone='6677889900'
        )
        design_profile = ProviderProfile.objects.create(
            user=design_prov,
            bio='Creative UI/UX Designer & Brand Strategist. I craft gorgeous layouts, pixel-perfect user interfaces, and memorable corporate logos.',
            skills=['Figma', 'Adobe Illustrator', 'UI/UX Design', 'Branding', 'Typography'],
            experience='3 years in startup product design.',
            hourly_rate=Decimal('40.00'),
            portfolio_items=[
                {"title": "FinTech Mobile App Design", "description": "High fidelity Figma mockups", "link": "https://example.com/fintech"},
                {"title": "SaaS Platform UI Kit", "description": "Modern dark-themed component library", "link": "https://example.com/uikit"}
            ]
        )

        python_prov = User.objects.create_user(
            username='python_expert',
            email='python@provider.com',
            password='password123',
            role='provider',
            phone='7788998877'
        )
        python_profile = ProviderProfile.objects.create(
            user=python_prov,
            bio='Python Backend Developer & Data Engineer. Focused on automated web scraping, API development, machine learning pipeline setup, and script automation.',
            skills=['Python', 'BeautifulSoup', 'Scrapy', 'Pandas', 'FastAPI', 'Machine Learning'],
            experience='4 years as an automation script engineer.',
            hourly_rate=Decimal('45.00'),
            portfolio_items=[
                {"title": "Web Scraper Framework", "description": "Distributed data extraction tool", "link": "https://example.com/scraper"},
                {"title": "Predictive Sales Engine", "description": "Machine learning regression model", "link": "https://example.com/predict"}
            ]
        )

        seo_prov = User.objects.create_user(
            username='seo_specialist',
            email='seo@provider.com',
            password='password123',
            role='provider',
            phone='8899009988'
        )
        seo_profile = ProviderProfile.objects.create(
            user=seo_prov,
            bio='SEO Specialist & Technical Copywriter. I optimize sites for search engines (Google rank), perform detailed keyword research, and write engaging SaaS landing pages.',
            skills=['SEO Audits', 'Keyword Research', 'Google Analytics', 'Copywriting', 'Content Strategy'],
            experience='3 years in digital marketing agencies.',
            hourly_rate=Decimal('30.00'),
            portfolio_items=[
                {"title": "SaaS Landing Copy", "description": "High converting sales copy", "link": "https://example.com/copy"},
                {"title": "SEO Case Study", "description": "Ranked a client site from Page 10 to Page 1", "link": "https://example.com/casestudy"}
            ]
        )

        mobile_prov = User.objects.create_user(
            username='mobile_wizard',
            email='mobile@provider.com',
            password='password123',
            role='provider',
            phone='9900110099'
        )
        mobile_profile = ProviderProfile.objects.create(
            user=mobile_prov,
            bio='Cross-platform Mobile Application Developer. I write clean, fast, and feature-rich iOS & Android apps using React Native and Flutter.',
            skills=['React Native', 'Flutter', 'iOS / Swift', 'Android / Kotlin', 'Firebase'],
            experience='6 years mobile app consultant.',
            hourly_rate=Decimal('60.00'),
            portfolio_items=[
                {"title": "Fitness Tracker App", "description": "Native health application", "link": "https://example.com/fitness"},
                {"title": "Food Delivery Client", "description": "Realtime tracking customer app", "link": "https://example.com/food"}
            ]
        )
        self.stdout.write('5 Providers created with custom profiles.')

        # 3. Create Service Listings (9 Listings)
        list1 = Listing.objects.create(
            provider=dev_prov,
            title='Build a Custom Django + React SaaS Application',
            description='I will design and build a robust, production-ready SaaS application from scratch using React on the frontend and Django REST Framework on the backend. Includes JWT authorization, database schema design, and clean styling.',
            category='web-dev',
            price=Decimal('850.00'),
            delivery_time=10
        )
        list2 = Listing.objects.create(
            provider=dev_prov,
            title='Secure JWT API Integration & Django Backend Setup',
            description='Need a secure, clean REST API? I will write a customized Django backend with JWT token authentication, CORS configuration, SQLite/PostgreSQL setup, and comprehensive endpoint documentation.',
            category='web-dev',
            price=Decimal('250.00'),
            delivery_time=4
        )

        list3 = Listing.objects.create(
            provider=design_prov,
            title='High-Fidelity Figma Mobile App & Web Design',
            description='I will create stunning, modern, and user-centric UI/UX designs in Figma. Includes wireframes, responsive mobile and desktop layouts, and interactive prototypes ready for development.',
            category='design',
            price=Decimal('350.00'),
            delivery_time=6
        )
        list4 = Listing.objects.create(
            provider=design_prov,
            title='Premium Brand Logo & Corporate Visual Identity',
            description='Get a unique, memorable, and minimalist corporate logo tailored to your startup. Includes typography guidelines, custom color palettes, and all source vector files.',
            category='design',
            price=Decimal('150.00'),
            delivery_time=3
        )

        list5 = Listing.objects.create(
            provider=python_prov,
            title='Custom Python Web Scraping & Data Extraction Automation',
            description='I will build a custom web scraper using BeautifulSoup or Scrapy to extract clean dataset directories from any public website. Delivers raw data in CSV/JSON formats.',
            category='web-dev',
            price=Decimal('120.00'),
            delivery_time=2
        )
        list6 = Listing.objects.create(
            provider=python_prov,
            title='Machine Learning Model Training & API Deployment',
            description='Training customized regression or classification machine learning models on your data. I will deploy the trained model as a FastAPI endpoint ready to receive queries.',
            category='web-dev',
            price=Decimal('950.00'),
            delivery_time=14
        )

        list7 = Listing.objects.create(
            provider=seo_prov,
            title='Complete On-Page SEO Audit & Keyword Research',
            description='I will audit your website for search engine visibility and produce a detailed PDF list of SEO improvements. Includes primary keyword research and optimization recommendations.',
            category='marketing',
            price=Decimal('90.00'),
            delivery_time=3
        )
        list8 = Listing.objects.create(
            provider=seo_prov,
            title='Copywriting for SaaS Landing Pages & Ad Copy',
            description='High converting copywriting for your startup landing page or marketing campaigns. I write headlines that sell, features breakdowns, and persuasive calls to action.',
            category='writing',
            price=Decimal('180.00'),
            delivery_time=4
        )

        list9 = Listing.objects.create(
            provider=mobile_prov,
            title='Cross-Platform React Native Mobile App Development',
            description='I will build a gorgeous, high-performance mobile application using React Native. The app will target both iOS and Android platforms with a single codebase, integrating Firebase services.',
            category='mobile',
            price=Decimal('1350.00'),
            delivery_time=15
        )
        self.stdout.write('9 Service listings created across categories.')

        # 4. Create Service Requests
        req1 = ServiceRequest.objects.create(
            customer=alex_cust,
            title='Need a Custom Social Network Portal',
            requirements='Looking for a developer to build a simplified social platform where users can register, post text updates, and leave comments on feeds. Must use React and have responsive layout.',
            category='web-dev',
            budget=Decimal('1200.00'),
            deadline=datetime.date.today() + datetime.timedelta(days=15)
        )
        req2 = ServiceRequest.objects.create(
            customer=sarah_cust,
            title='Minimalist Icon Set for Travel SaaS',
            requirements='Require a set of 15 custom travel icons (e.g. plane, passport, hotel, map) in SVG format. Style must be flat, playful, and match our blue-green color palette.',
            category='design',
            budget=Decimal('100.00'),
            deadline=datetime.date.today() + datetime.timedelta(days=7),
            target_provider=design_prov
        )
        req3 = ServiceRequest.objects.create(
            customer=john_cust,
            title='Automated Price Monitor Script',
            requirements='A python script that monitors prices on 3 retail sites and emails me when prices drop below a specified threshold. Must run daily.',
            category='web-dev',
            budget=Decimal('150.00'),
            deadline=datetime.date.today() + datetime.timedelta(days=5),
            target_provider=python_prov
        )
        self.stdout.write('3 Customer service requests created.')

        # 5. Create Projects (Simulate project tracking workflow)
        # Project 1: Pending (Alex hired Dev)
        p1 = Project.objects.create(
            customer=alex_cust,
            provider=dev_prov,
            listing=list2,
            title='Secure JWT API Integration',
            description='Custom JWT backend configuration.',
            budget=Decimal('250.00'),
            deadline=datetime.date.today() + datetime.timedelta(days=4),
            status='pending'
        )

        # Project 2: In Progress (Sarah hired Dev)
        p2 = Project.objects.create(
            customer=sarah_cust,
            provider=dev_prov,
            listing=list1,
            title='SaaS Platform Backend & React Interface',
            description='Development of SaaS analytics portal.',
            budget=Decimal('850.00'),
            deadline=datetime.date.today() + datetime.timedelta(days=10),
            status='in_progress'
        )

        # Project 3: Completed & Delivered (Alex hired Design - Review Submitted)
        p3 = Project.objects.create(
            customer=alex_cust,
            provider=design_prov,
            listing=list4,
            title='Logo design for Tech Startup',
            description='Minimalist logo design.',
            budget=Decimal('150.00'),
            deadline=datetime.date.today() - datetime.timedelta(days=2),
            status='delivered',
            delivery_note='Hi Alex, the project is completed! I uploaded the final vector files in SVG format and a preview JPEG.',
        )
        
        # Add Review for Project 3 (Delivered)
        Review.objects.create(
            project=p3,
            customer=alex_cust,
            provider=design_prov,
            rating=5,
            feedback='Spectacular service! She took feedback very well and delivered a brand mark that exceeded my expectations. Fast communication and professional deliverables.'
        )

        # Project 4: Delivered (Emma hired Python Expert)
        p4 = Project.objects.create(
            customer=emma_cust,
            provider=python_prov,
            listing=list5,
            title='Real estate scraper',
            description='Scraping properties directory.',
            budget=Decimal('120.00'),
            deadline=datetime.date.today() - datetime.timedelta(days=1),
            status='delivered',
            delivery_note='Finished the script and extracted 5,000 listings into a JSON. The script runs with standard python commands.',
        )
        Review.objects.create(
            project=p4,
            customer=emma_cust,
            provider=python_prov,
            rating=4,
            feedback='Great script, extracts all details cleanly. Saved us hours of manual data entry!'
        )

        self.stdout.write('Projects and reviews created.')
        self.stdout.write('Database seeding complete successfully.')
