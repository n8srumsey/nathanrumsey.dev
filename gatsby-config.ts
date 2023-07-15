import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `nathanrumsey.dev`,
    siteUrl: `https://nathanrumsey.dev`,
    menulinks: [
      {
        name: "About",
        link: "/#about"
      },
      {
        name: "experience",
        link: "/#experience"
      },
      {
        name: "projects",
        link: "/#projects"
      },
      {
        name: "Contact",
        link: "/#contact"
      },
      {
        name: "Resume",
        link: "/resume.pdf"
      }
    ]
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    {resolve: "gatsby-plugin-sass"},
    "gatsby-plugin-smoothscroll",
  ]

};

export default config;
