import { defineConfig } from 'vitepress'

const base =
  process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base,
  title: '开发者文档',
  description: 'Windows 与 Linux 开发环境搭建指南',
  lastUpdated: true,
  head: [['link', { rel: 'icon', href: '/logo.svg', type: 'image/x-icon' }]],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Windows', link: '/windows/' },
      { text: 'Linux', link: '/linux/' },
      { text: 'Docker', link: '/docker/' },
      { text: 'Network', link: '/network/' },
      { text: 'Git', link: '/git/' },
    ],

    sidebar: [
      {
        text: 'Windows',
        collapsed: false,
        items: [
          { text: '概览', link: '/windows/' },
          { text: 'WSL2 配置 SSH', link: '/windows/wsl配置ssh' },
        ],
      },
      {
        text: 'Linux',
        collapsed: false,
        items: [{ text: '概览', link: '/linux/' }],
      },
      {
        text: 'Docker',
        collapsed: false,
        items: [
          { text: '概览', link: '/docker/' },
          {
            text: '容器访问宿主机映射端口失败',
            link: '/docker/容器访问宿主机映射端口失败',
          },
        ],
      },
      {
        text: 'Network',
        collapsed: false,
        items: [
          { text: '概览', link: '/network/' },
          {
            text: '计算机流量从零梳理（大纲）',
            link: '/network/计算机流量从零梳理',
          },
        ],
      },
      {
        text: 'Git',
        collapsed: false,
        items: [
          { text: '概览', link: '/git/' },
          { text: '从零开始：Submodule', link: '/git/submodule从零开始' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/xlj-hly' }],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索',
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '重置',
                backButtonTitle: '关闭',
                noResultsText: '没有找到相关结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '回车',
                  navigateText: '导航',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc',
                },
              },
            },
          },
        },
      },
    },
  },
})
