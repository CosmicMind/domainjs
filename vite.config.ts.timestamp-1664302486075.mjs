// vite.config.ts
import {
  URL,
  fileURLToPath,
} from "node:url"
import {
  defineConfig,
} from "vite"
import dts from "vite-plugin-dts"
const __vite_injected_original_import_meta_url = "file:///Users/daniel/Repos/cosmicmind/workspace/libs/domain/vite.config.ts"
const packageName = process.env.npm_package_name
const packageVersion = JSON.stringify(process.env.npm_package_version)
const external = [
  "yup",
  "@cosmicmind/foundation",
  "@cosmicmind/patterns"
]
const globals = {}
const emptyOutDir = true
const formats = [ "es" ]
const vite_config_default = defineConfig(({ mode }) => {
  const watch = "watch" === mode ? {
    include: [
      "src/**/*"
    ],
  } : void 0
  return {
    define: {
      "__PACKAGE_NAME__": packageVersion,
      "__PACKAGE_VERSION__": packageVersion,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      },
    },
    plugins: [
      dts()
    ],
    build: {
      emptyOutDir,
      lib: {
        name: packageName,
        entry: "src/index.ts",
        formats,
        fileName: "lib.es",
      },
      rollupOptions: {
        external,
        output: {
          globals,
        },
      },
      watch,
    },
  }
})
export {
  vite_config_default as default,
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZGFuaWVsL1JlcG9zL2Nvc21pY21pbmQvd29ya3NwYWNlL2xpYnMvZG9tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZGFuaWVsL1JlcG9zL2Nvc21pY21pbmQvd29ya3NwYWNlL2xpYnMvZG9tYWluL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9kYW5pZWwvUmVwb3MvY29zbWljbWluZC93b3Jrc3BhY2UvbGlicy9kb21haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQge1xuICBVUkwsXG4gIGZpbGVVUkxUb1BhdGgsXG59IGZyb20gJ25vZGU6dXJsJ1xuXG5pbXBvcnQge1xuICBkZWZpbmVDb25maWcsXG4gIExpYnJhcnlGb3JtYXRzLFxufSBmcm9tICd2aXRlJ1xuXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcblxuY29uc3QgcGFja2FnZU5hbWUgPSBwcm9jZXNzLmVudi5ucG1fcGFja2FnZV9uYW1lXG5jb25zdCBwYWNrYWdlVmVyc2lvbiA9IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24pXG5cbmNvbnN0IGV4dGVybmFsID0gW1xuICAneXVwJyxcbiAgJ0Bjb3NtaWN2ZXJzZS9mb3VuZGF0aW9uJyxcbiAgJ0Bjb3NtaWN2ZXJzZS9wYXR0ZXJucydcbl1cbmNvbnN0IGdsb2JhbHMgPSB7fVxuY29uc3QgZW1wdHlPdXREaXIgPSB0cnVlXG5jb25zdCBmb3JtYXRzOiBMaWJyYXJ5Rm9ybWF0c1tdID0gWyAnZXMnIF1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCB3YXRjaCA9ICd3YXRjaCcgPT09IG1vZGUgPyB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3NyYy8qKi8qJ1xuICAgIF0sXG4gIH06IHVuZGVmaW5lZFxuXG4gIHJldHVybiB7XG4gICAgZGVmaW5lOiB7XG4gICAgICAnX19QQUNLQUdFX05BTUVfXyc6IHBhY2thZ2VWZXJzaW9uLFxuICAgICAgJ19fUEFDS0FHRV9WRVJTSU9OX18nOiBwYWNrYWdlVmVyc2lvbixcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIGR0cygpXG4gICAgXSxcbiAgICBidWlsZDoge1xuICAgICAgZW1wdHlPdXREaXIsXG4gICAgICBsaWI6IHtcbiAgICAgICAgbmFtZTogcGFja2FnZU5hbWUsXG4gICAgICAgIGVudHJ5OiAnc3JjL2luZGV4LnRzJyxcbiAgICAgICAgZm9ybWF0cyxcbiAgICAgICAgZmlsZU5hbWU6ICdsaWIuZXMnLFxuICAgICAgfSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgZXh0ZXJuYWwsXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGdsb2JhbHMsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgd2F0Y2gsXG4gICAgfSxcbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQThVO0FBQUEsRUFDNVU7QUFBQSxFQUNBO0FBQUEsT0FDSztBQUVQO0FBQUEsRUFDRTtBQUFBLE9BRUs7QUFFUCxPQUFPLFNBQVM7QUFWZ00sSUFBTSwyQ0FBMkM7QUFZalEsSUFBTSxjQUFjLFFBQVEsSUFBSTtBQUNoQyxJQUFNLGlCQUFpQixLQUFLLFVBQVUsUUFBUSxJQUFJLG1CQUFtQjtBQUVyRSxJQUFNLFdBQVc7QUFBQSxFQUNmO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUNBLElBQU0sVUFBVSxDQUFDO0FBQ2pCLElBQU0sY0FBYztBQUNwQixJQUFNLFVBQTRCLENBQUUsSUFBSztBQUV6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLFFBQVEsWUFBWSxPQUFPO0FBQUEsSUFDL0IsU0FBUztBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQUEsRUFDRixJQUFHO0FBRUgsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sb0JBQW9CO0FBQUEsTUFDcEIsdUJBQXVCO0FBQUEsSUFDekI7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsTUFDdEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUEsSUFDTjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0w7QUFBQSxNQUNBLEtBQUs7QUFBQSxRQUNILE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxRQUNQO0FBQUEsUUFDQSxVQUFVO0FBQUEsTUFDWjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2I7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
