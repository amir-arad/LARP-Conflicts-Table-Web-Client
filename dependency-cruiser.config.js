/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: [
        '^node_modules',
        '\\.(test|spec)\\.(js|ts|tsx)$',
        '\\.(stories)\\.(js|ts|tsx)$',
      ],
    },
    includeOnly: {
      path: ['^src'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
        theme: {
          graph: {
            rankdir: 'LR',
            splines: 'ortho',
          },
        },
      },
      archi: {
        collapsePattern: '^src/[^/]+|^src/components/ui/[^/]+',
      },
      text: {
        highlightPathsInColor: true,
      },
    },
  },
};
