// apps/docs/vite.config.ts
import analog from "file:///Users/gabrielguerrero/workspace/ngrx-traits2/node_modules/@analogjs/platform/src/index.js";
import { nxViteTsPaths } from "file:///Users/gabrielguerrero/workspace/ngrx-traits2/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
import { globSync } from "file:///Users/gabrielguerrero/workspace/ngrx-traits2/node_modules/glob/dist/esm/index.js";
import { defineConfig, splitVendorChunkPlugin } from "file:///Users/gabrielguerrero/workspace/ngrx-traits2/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/Users/gabrielguerrero/workspace/ngrx-traits2/apps/docs";
var vite_config_default = defineConfig(({ mode }) => {
  return {
    root: __vite_injected_original_dirname,
    cacheDir: `../../node_modules/.vite`,
    build: {
      outDir: "../../dist/apps/documentation/client",
      reportCompressedSize: true,
      target: ["es2020"]
    },
    server: {
      fs: {
        allow: ["."]
      }
    },
    plugins: [
      analog({
        ssr: true,
        prerender: {
          routes: async () => [
            "/",
            ...globSync("apps/docs/src/app/pages/**/*.md").map(
              (file) => "/" + file.replace("apps/docs/src/app/pages/", "").replace(".md", "")
            )
          ]
        }
      }),
      nxViteTsPaths(),
      splitVendorChunkPlugin()
    ],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["src/test-setup.ts"],
      include: ["**/*.spec.ts"],
      reporters: ["default"]
    },
    define: {
      "import.meta.vitest": mode !== "production"
    },
    optimizeDeps: {
      include: ["@ng-icons/core"]
    },
    ssr: {
      noExternal: ["@ng-icons/core"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy9kb2NzL3ZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2dhYnJpZWxndWVycmVyby93b3Jrc3BhY2UvbmdyeC10cmFpdHMyL2FwcHMvZG9jc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2dhYnJpZWxndWVycmVyby93b3Jrc3BhY2UvbmdyeC10cmFpdHMyL2FwcHMvZG9jcy92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZ2FicmllbGd1ZXJyZXJvL3dvcmtzcGFjZS9uZ3J4LXRyYWl0czIvYXBwcy9kb2NzL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuaW1wb3J0IGFuYWxvZyBmcm9tICdAYW5hbG9nanMvcGxhdGZvcm0nO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gJ0BueC92aXRlL3BsdWdpbnMvbngtdHNjb25maWctcGF0aHMucGx1Z2luJztcbmltcG9ydCB7IGdsb2JTeW5jIH0gZnJvbSAnZ2xvYic7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4gfSBmcm9tICd2aXRlJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgcmV0dXJuIHtcbiAgICByb290OiBfX2Rpcm5hbWUsXG4gICAgY2FjaGVEaXI6IGAuLi8uLi9ub2RlX21vZHVsZXMvLnZpdGVgLFxuXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogJy4uLy4uL2Rpc3QvYXBwcy9kb2N1bWVudGF0aW9uL2NsaWVudCcsXG4gICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSxcbiAgICAgIHRhcmdldDogWydlczIwMjAnXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgZnM6IHtcbiAgICAgICAgYWxsb3c6IFsnLiddLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIGFuYWxvZyh7XG4gICAgICAgIHNzcjogdHJ1ZSxcbiAgICAgICAgcHJlcmVuZGVyOiB7XG4gICAgICAgICAgcm91dGVzOiBhc3luYyAoKSA9PiBbXG4gICAgICAgICAgICAnLycsXG4gICAgICAgICAgICAuLi5nbG9iU3luYygnYXBwcy9kb2NzL3NyYy9hcHAvcGFnZXMvKiovKi5tZCcpLm1hcChcbiAgICAgICAgICAgICAgKGZpbGUpID0+XG4gICAgICAgICAgICAgICAgJy8nICtcbiAgICAgICAgICAgICAgICBmaWxlLnJlcGxhY2UoJ2FwcHMvZG9jcy9zcmMvYXBwL3BhZ2VzLycsICcnKS5yZXBsYWNlKCcubWQnLCAnJyksXG4gICAgICAgICAgICApLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIG54Vml0ZVRzUGF0aHMoKSxcbiAgICAgIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4oKSxcbiAgICBdLFxuICAgIHRlc3Q6IHtcbiAgICAgIGdsb2JhbHM6IHRydWUsXG4gICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgIHNldHVwRmlsZXM6IFsnc3JjL3Rlc3Qtc2V0dXAudHMnXSxcbiAgICAgIGluY2x1ZGU6IFsnKiovKi5zcGVjLnRzJ10sXG4gICAgICByZXBvcnRlcnM6IFsnZGVmYXVsdCddLFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAnaW1wb3J0Lm1ldGEudml0ZXN0JzogbW9kZSAhPT0gJ3Byb2R1Y3Rpb24nLFxuICAgIH0sXG5cbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFsnQG5nLWljb25zL2NvcmUnXSxcbiAgICB9LFxuICAgIHNzcjoge1xuICAgICAgbm9FeHRlcm5hbDogWydAbmctaWNvbnMvY29yZSddLFxuICAgIH0sXG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPLFlBQVk7QUFDbkIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxnQkFBZ0I7QUFDekIsU0FBUyxjQUFjLDhCQUE4QjtBQUpyRCxJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixVQUFVO0FBQUEsSUFFVixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsTUFDUixzQkFBc0I7QUFBQSxNQUN0QixRQUFRLENBQUMsUUFBUTtBQUFBLElBQ25CO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixJQUFJO0FBQUEsUUFDRixPQUFPLENBQUMsR0FBRztBQUFBLE1BQ2I7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxXQUFXO0FBQUEsVUFDVCxRQUFRLFlBQVk7QUFBQSxZQUNsQjtBQUFBLFlBQ0EsR0FBRyxTQUFTLGlDQUFpQyxFQUFFO0FBQUEsY0FDN0MsQ0FBQyxTQUNDLE1BQ0EsS0FBSyxRQUFRLDRCQUE0QixFQUFFLEVBQUUsUUFBUSxPQUFPLEVBQUU7QUFBQSxZQUNsRTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxjQUFjO0FBQUEsTUFDZCx1QkFBdUI7QUFBQSxJQUN6QjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osU0FBUztBQUFBLE1BQ1QsYUFBYTtBQUFBLE1BQ2IsWUFBWSxDQUFDLG1CQUFtQjtBQUFBLE1BQ2hDLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUN2QjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sc0JBQXNCLFNBQVM7QUFBQSxJQUNqQztBQUFBLElBRUEsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLGdCQUFnQjtBQUFBLElBQzVCO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxZQUFZLENBQUMsZ0JBQWdCO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
