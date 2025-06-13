# Markdown Portfolio

A modern, responsive portfolio website built with Next.js and powered by Markdown files.

## Features

- 🎨 **Modern Design**: Clean, professional layout with a persistent sidebar
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- 📝 **Markdown-Powered**: All content managed through simple Markdown files
- 🚀 **Fast**: Built with Next.js for optimal performance
- 🎯 **SEO-Friendly**: Optimized for search engines
- 🛠 **Easy to Customize**: Simple configuration through Markdown frontmatter

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Customization

### Personal Information

Edit `_content/about.md` to update your personal information:

```markdown
---
name: Your Name
title: Your Job Title
location: Your Location
email: your.email@example.com
linkedin: https://linkedin.com/in/yourprofile
github: https://github.com/yourusername
twitter: https://twitter.com/yourusername
avatar: /avatar.jpg
---

# About Me

Your bio content here...
```

### Navigation

Edit `_content/navigation.md` to customize the navigation menu:

```markdown
---
navigation:
  - name: Home
    href: /
    icon: home
  - name: Projects
    href: /project
    icon: folder
  # Add more navigation items...
---
```

### Projects

Add your projects as Markdown files in the `_projects/` directory:

```markdown
---
title: Project Name
slug: project-slug
date: February 1, 2023
description: Brief project description
photo: /projects/project-image.jpg
---

Your project content in Markdown...
```

### Images

- Add your avatar image as `public/avatar.jpg`
- Add project images in `public/projects/`
- Update the image paths in your Markdown files

## Project Structure

```
├── _content/           # Site content (about, navigation)
├── _projects/          # Project markdown files
├── components/         # React components
├── layouts/           # Layout components
├── pages/             # Next.js pages
├── public/            # Static assets
├── styles/            # CSS styles
└── utils/             # Utility functions
```

## Pages

- **Home** (`/`): Welcome page with introduction
- **Projects** (`/project`): Grid of all projects
- **Project Detail** (`/project/[slug]`): Individual project pages
- **About** (`/about`): Detailed about page
- **Contact** (`/contact`): Contact information and form

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

You can also deploy to Netlify, AWS, or any other static hosting service.

## Technologies Used

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Gray Matter** - Markdown frontmatter parsing
- **React Markdown** - Markdown rendering

## License

MIT License - see LICENSE.md for details.
