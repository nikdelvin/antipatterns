// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Antipatterns Guide',
			description: 'Learn to recognize and avoid common programming antipatterns',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com' },
			],
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'Welcome', slug: 'index' },
						{ label: 'How to Use This Guide', slug: 'introduction/how-to-use' },
					],
				},
				{
					label: 'Source Files',
					items: [
						{ label: '📁 Browse All Files', link: '/source/' },
					],
				},
				{
					label: 'Architecture Antipatterns',
					items: [
						{ label: 'Overview', slug: 'architecture/overview' },
						{ label: 'God Object', slug: 'architecture/god-object' },
						{ label: 'Service Locator', slug: 'architecture/service-locator' },
						{ label: 'Circular Dependencies', slug: 'architecture/circular-dependencies' },
						{ label: 'Copy-Paste Inheritance', slug: 'architecture/copy-paste-inheritance' },
						{ label: 'Singleton Abuse', slug: 'architecture/singleton-abuse' },
					],
				},
				{
					label: 'Security Antipatterns',
					items: [
						{ label: 'Overview (OWASP Top 10)', slug: 'security/overview' },
						{ label: 'Broken Access Control', slug: 'security/broken-access-control' },
						{ label: 'Cryptographic Failures', slug: 'security/cryptographic-failures' },
						{ label: 'Injection Attacks', slug: 'security/injection' },
						{ label: 'Authentication Failures', slug: 'security/authentication' },
						{ label: 'Security Misconfiguration', slug: 'security/misconfiguration' },
					],
				},
				{
					label: 'Code Quality Antipatterns',
					items: [
						{ label: 'Overview', slug: 'code-quality/overview' },
						{ label: 'Monkey Patching', slug: 'code-quality/monkey-patching' },
						{ label: 'Magic Numbers', slug: 'code-quality/magic-numbers' },
						{ label: 'Callback Hell', slug: 'code-quality/callback-hell' },
						{ label: 'God Middleware', slug: 'code-quality/god-middleware' },
					],
				},
				{
					label: 'State Management Antipatterns',
					items: [
						{ label: 'Overview', slug: 'state/overview' },
						{ label: 'Global Mutable State', slug: 'state/global-mutable-state' },
						{ label: 'Feature Flag Chaos', slug: 'state/feature-flags' },
					],
				},
				{
					label: 'Error Handling Antipatterns',
					items: [
						{ label: 'Overview', slug: 'errors/overview' },
						{ label: 'Error Swallowing', slug: 'errors/swallowing' },
						{ label: 'Error Exposure', slug: 'errors/exposure' },
					],
				},
				{
					label: 'Database Antipatterns',
					items: [
						{ label: 'Overview', slug: 'database/overview' },
						{ label: 'God Table', slug: 'database/god-table' },
						{ label: 'SQL Injection', slug: 'database/sql-injection' },
					],
				},
				{
					label: 'Conclusion',
					items: [
						{ label: '🎯 Summary & Takeaways', slug: 'conclusion' },
					],
				},
			],
		}),
	],
});
