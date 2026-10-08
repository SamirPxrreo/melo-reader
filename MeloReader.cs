using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Collections.Generic;

namespace MeloReaderApp
{
    class Program
    {
        private static HttpListener listener;
        private static string appDirectory;
        private static string targetFilePath = null;
        private static bool isRunning = true;

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                appDirectory = AppDomain.CurrentDomain.BaseDirectory;

                // Si el usuario pasa un archivo por argumento (o arrastra un .md encima del .exe)
                if (args.Length > 0 && File.Exists(args[0]))
                {
                    targetFilePath = Path.GetFullPath(args[0]);
                }

                // Encontrar puerto disponible
                int port = FindAvailablePort(3333);

                // Iniciar servidor HTTP interno
                listener = new HttpListener();
                listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                listener.Start();

                Thread serverThread = new Thread(ListenRequests);
                serverThread.IsBackground = true;
                serverThread.Start();

                // Buscar Microsoft Edge o Chrome para modo Desktop App (--app)
                string browserPath = FindChromiumBrowser();
                string appUrl = "http://127.0.0.1:" + port + "/";

                if (!string.IsNullOrEmpty(browserPath))
                {
                    string profileDir = Path.Combine(Path.GetTempPath(), "MeloReader_Profile");
                    string arguments = string.Format("--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1280,850", appUrl, profileDir);

                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserPath;
                    psi.Arguments = arguments;
                    psi.UseShellExecute = false;

                    Process p = Process.Start(psi);
                    if (p != null)
                    {
                        p.WaitForExit();
                    }
                }
                else
                {
                    // Fallback al navegador predeterminado del sistema
                    Process.Start(appUrl);
                    // Mantener vivo hasta que se cierre externamente
                    while (isRunning)
                    {
                        Thread.Sleep(1000);
                    }
                }
            }
            catch (Exception ex)
            {
                try
                {
                    File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "error.log"), ex.ToString());
                }
                catch { }
            }
            finally
            {
                isRunning = false;
                if (listener != null && listener.IsListening)
                {
                    try { listener.Stop(); } catch { }
                }
            }
        }

        private static int FindAvailablePort(int startingPort)
        {
            for (int port = startingPort; port < startingPort + 100; port++)
            {
                try
                {
                    TcpListener tcp = new TcpListener(IPAddress.Loopback, port);
                    tcp.Start();
                    tcp.Stop();
                    return port;
                }
                catch
                {
                    // Puerto ocupado, probar siguiente
                }
            }
            return 3333;
        }

        private static string FindChromiumBrowser()
        {
            string[] possiblePaths = new string[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
            };

            foreach (string p in possiblePaths)
            {
                if (File.Exists(p)) return p;
            }
            return null;
        }

        private static void ListenRequests()
        {
            while (isRunning && listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((c) => ProcessRequest((HttpListenerContext)c), context);
                }
                catch
                {
                    if (!isRunning) break;
                }
            }
        }

        private static void ProcessRequest(HttpListenerContext context)
        {
            HttpListenerRequest request = context.Request;
            HttpListenerResponse response = context.Response;

            try
            {
                string rawUrl = request.Url.AbsolutePath;
                if (rawUrl == "/") rawUrl = "/index.html";

                // API para obtener el archivo Markdown pasado por argumento al .exe
                if (rawUrl == "/api/opened-file")
                {
                    response.ContentType = "application/json; charset=utf-8";
                    string json;

                    if (!string.IsNullOrEmpty(targetFilePath) && File.Exists(targetFilePath))
                    {
                        string content = File.ReadAllText(targetFilePath, Encoding.UTF8);
                        string fileName = Path.GetFileName(targetFilePath);
                        json = string.Format("{{\"hasFile\": true, \"filename\": {0}, \"content\": {1}}}",
                            EscapeJsonString(fileName),
                            EscapeJsonString(content));
                    }
                    else
                    {
                        json = "{\"hasFile\": false}";
                    }

                    byte[] jsonBytes = Encoding.UTF8.GetBytes(json);
                    response.ContentLength64 = jsonBytes.Length;
                    response.OutputStream.Write(jsonBytes, 0, jsonBytes.Length);
                    response.OutputStream.Close();
                    return;
                }

                // Archivos estáticos del lector
                string relativePath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(appDirectory, relativePath);

                if (File.Exists(filePath))
                {
                    string ext = Path.GetExtension(filePath).ToLower();
                    response.ContentType = GetContentType(ext);
                    byte[] fileBytes = File.ReadAllBytes(filePath);
                    response.ContentLength64 = fileBytes.Length;
                    response.OutputStream.Write(fileBytes, 0, fileBytes.Length);
                }
                else
                {
                    response.StatusCode = 404;
                    byte[] notFound = Encoding.UTF8.GetBytes("404 No Encontrado");
                    response.OutputStream.Write(notFound, 0, notFound.Length);
                }
            }
            catch { }
            finally
            {
                try { response.OutputStream.Close(); } catch { }
            }
        }

        private static string EscapeJsonString(string s)
        {
            if (s == null) return "\"\"";
            StringBuilder sb = new StringBuilder();
            sb.Append('"');
            foreach (char c in s)
            {
                switch (c)
                {
                    case '\\': sb.Append("\\\\"); break;
                    case '\"': sb.Append("\\\""); break;
                    case '\b': sb.Append("\\b"); break;
                    case '\f': sb.Append("\\f"); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': sb.Append("\\r"); break;
                    case '\t': sb.Append("\\t"); break;
                    default:
                        if (c < ' ')
                        {
                            sb.AppendFormat("\\u{0:x4}", (int)c);
                        }
                        else
                        {
                            sb.Append(c);
                        }
                        break;
                }
            }
            sb.Append('"');
            return sb.ToString();
        }

        private static string GetContentType(string ext)
        {
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".json": return "application/json; charset=utf-8";
                case ".md": return "text/markdown; charset=utf-8";
                case ".png": return "image/png";
                case ".jpg": case ".jpeg": return "image/jpeg";
                case ".svg": return "image/svg+xml";
                case ".ico": return "image/x-icon";
                default: return "application/octet-stream";
            }
        }
    }
}
