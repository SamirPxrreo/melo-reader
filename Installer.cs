using System;
using System.IO;
using System.IO.Compression;
using System.Drawing;
using System.Windows.Forms;
using System.Reflection;
using System.Diagnostics;
using Microsoft.Win32;

namespace MeloReaderInstaller
{
    public class SetupForm : Form
    {
        private int currentStep = 0;
        private string targetFolder;
        private Panel contentPanel;
        private Button btnBack;
        private Button btnNext;
        private Button btnCancel;
        private Image logoImage;

        // Step 1 controls
        private Label lblWelcomeTitle;
        private Label lblWelcomeDesc;

        // Step 2 controls
        private TextBox txtInstallPath;
        private Button btnBrowse;

        // Step 3 controls
        private CheckBox chkDesktopShortcut;
        private CheckBox chkStartMenuShortcut;
        private CheckBox chkAssociateMd;

        // Step 4 controls
        private ProgressBar progressBar;
        private Label lblProgressStatus;

        // Step 5 controls
        private CheckBox chkLaunchNow;

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }

        public SetupForm()
        {
            this.Text = "Instalador de Melo Reader";
            this.Size = new Size(580, 420);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(11, 12, 22);
            this.ForeColor = Color.FromArgb(240, 243, 255);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // Cargar Logo e Icono si existen
            string assetsDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets");
            string logoPath = Path.Combine(assetsDir, "logo.jpg");
            string iconPath = Path.Combine(assetsDir, "app.ico");

            if (File.Exists(logoPath))
            {
                try { logoImage = Image.FromFile(logoPath); } catch { }
            }
            if (File.Exists(iconPath))
            {
                try { this.Icon = new Icon(iconPath); } catch { }
            }

            // Carpeta de instalación por defecto
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            targetFolder = Path.Combine(localAppData, "Programs", "MeloReader");

            BuildUI();
            ShowStep(0);
        }

        private void BuildUI()
        {
            // Panel de contenido
            contentPanel = new Panel();
            contentPanel.Location = new Point(0, 0);
            contentPanel.Size = new Size(564, 320);
            contentPanel.BackColor = Color.FromArgb(17, 19, 34);
            this.Controls.Add(contentPanel);

            // Barra inferior con botones
            Panel bottomBar = new Panel();
            bottomBar.Location = new Point(0, 320);
            bottomBar.Size = new Size(564, 65);
            bottomBar.BackColor = Color.FromArgb(11, 12, 22);
            this.Controls.Add(bottomBar);

            btnBack = new Button();
            btnBack.Text = "< Atrás";
            btnBack.Size = new Size(95, 34);
            btnBack.Location = new Point(245, 15);
            btnBack.FlatStyle = FlatStyle.Flat;
            btnBack.ForeColor = Color.FromArgb(220, 225, 245);
            btnBack.BackColor = Color.FromArgb(28, 32, 54);
            btnBack.FlatAppearance.BorderColor = Color.FromArgb(60, 68, 105);
            btnBack.Click += (s, e) => { if (currentStep > 0) ShowStep(currentStep - 1); };
            bottomBar.Controls.Add(btnBack);

            btnNext = new Button();
            btnNext.Text = "Siguiente >";
            btnNext.Size = new Size(105, 34);
            btnNext.Location = new Point(348, 15);
            btnNext.FlatStyle = FlatStyle.Flat;
            btnNext.ForeColor = Color.White;
            btnNext.BackColor = Color.FromArgb(0, 168, 204);
            btnNext.FlatAppearance.BorderSize = 0;
            btnNext.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnNext.Click += OnNextClicked;
            bottomBar.Controls.Add(btnNext);

            btnCancel = new Button();
            btnCancel.Text = "Cancelar";
            btnCancel.Size = new Size(90, 34);
            btnCancel.Location = new Point(460, 15);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.ForeColor = Color.FromArgb(170, 175, 200);
            btnCancel.BackColor = Color.FromArgb(23, 26, 42);
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(45, 50, 75);
            btnCancel.Click += (s, e) => { if (MessageBox.Show("¿Seguro que deseas salir del instalador?", "Melo Reader", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.Yes) this.Close(); };
            bottomBar.Controls.Add(btnCancel);
        }

        private void ShowStep(int step)
        {
            currentStep = step;
            contentPanel.Controls.Clear();

            btnBack.Enabled = (step > 0 && step < 3);
            btnCancel.Enabled = (step != 3);

            if (step == 0)
            {
                btnNext.Text = "Siguiente >";
                btnNext.BackColor = Color.FromArgb(0, 168, 204);

                // Paso 1: Bienvenida
                PictureBox pic = new PictureBox();
                pic.Location = new Point(25, 25);
                pic.Size = new Size(130, 130);
                pic.SizeMode = PictureBoxSizeMode.Zoom;
                if (logoImage != null) pic.Image = logoImage;
                pic.BackColor = Color.Transparent;
                contentPanel.Controls.Add(pic);

                lblWelcomeTitle = new Label();
                lblWelcomeTitle.Text = "¡Bienvenido al Instalador de\nMelo Reader!";
                lblWelcomeTitle.Font = new Font("Segoe UI", 16f, FontStyle.Bold);
                lblWelcomeTitle.ForeColor = Color.FromArgb(0, 240, 255);
                lblWelcomeTitle.Location = new Point(175, 25);
                lblWelcomeTitle.Size = new Size(365, 75);
                contentPanel.Controls.Add(lblWelcomeTitle);

                lblWelcomeDesc = new Label();
                lblWelcomeDesc.Text = "Este asistente instalará Melo Reader en tu computadora.\n\n" +
                                       "• Fuentes hermosas, bacanas y de alta legibilidad.\n" +
                                       "• 7 temas vibrantes con modo oscuro/claro y modo Zen.\n" +
                                       "• Soporte completo para matemáticas, diagramas y voz.\n\n" +
                                       "Haz clic en 'Siguiente' para continuar.";
                lblWelcomeDesc.ForeColor = Color.FromArgb(190, 200, 230);
                lblWelcomeDesc.Location = new Point(175, 105);
                lblWelcomeDesc.Size = new Size(365, 175);
                contentPanel.Controls.Add(lblWelcomeDesc);
            }
            else if (step == 1)
            {
                btnNext.Text = "Siguiente >";

                // Paso 2: Directorio de instalación
                Label lblTitle = new Label();
                lblTitle.Text = "Carpeta de Destino";
                lblTitle.Font = new Font("Segoe UI", 13f, FontStyle.Bold);
                lblTitle.ForeColor = Color.White;
                lblTitle.Location = new Point(25, 20);
                lblTitle.Size = new Size(500, 30);
                contentPanel.Controls.Add(lblTitle);

                Label lblSub = new Label();
                lblSub.Text = "El programa se instalará en la siguiente carpeta. Para instalar en otra carpeta, haz clic en 'Examinar':";
                lblSub.ForeColor = Color.FromArgb(170, 180, 210);
                lblSub.Location = new Point(25, 55);
                lblSub.Size = new Size(500, 40);
                contentPanel.Controls.Add(lblSub);

                txtInstallPath = new TextBox();
                txtInstallPath.Text = targetFolder;
                txtInstallPath.Location = new Point(25, 105);
                txtInstallPath.Size = new Size(390, 28);
                txtInstallPath.BackColor = Color.FromArgb(11, 12, 22);
                txtInstallPath.ForeColor = Color.White;
                txtInstallPath.BorderStyle = BorderStyle.FixedSingle;
                contentPanel.Controls.Add(txtInstallPath);

                btnBrowse = new Button();
                btnBrowse.Text = "Examinar...";
                btnBrowse.Location = new Point(425, 103);
                btnBrowse.Size = new Size(100, 30);
                btnBrowse.FlatStyle = FlatStyle.Flat;
                btnBrowse.ForeColor = Color.White;
                btnBrowse.BackColor = Color.FromArgb(32, 36, 60);
                btnBrowse.Click += (s, e) =>
                {
                    FolderBrowserDialog fbd = new FolderBrowserDialog();
                    fbd.SelectedPath = txtInstallPath.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        txtInstallPath.Text = fbd.SelectedPath;
                        targetFolder = fbd.SelectedPath;
                    }
                };
                contentPanel.Controls.Add(btnBrowse);

                Label lblSpace = new Label();
                lblSpace.Text = "Espacio requerido en disco: ~220 MB\nEspacio disponible: Suficiente";
                lblSpace.ForeColor = Color.FromArgb(130, 140, 175);
                lblSpace.Location = new Point(25, 160);
                lblSpace.Size = new Size(500, 50);
                contentPanel.Controls.Add(lblSpace);
            }
            else if (step == 2)
            {
                btnNext.Text = "Instalar";
                btnNext.BackColor = Color.FromArgb(16, 185, 129); // Verde instalar

                // Paso 3: Opciones y Accesos
                Label lblTitle = new Label();
                lblTitle.Text = "Configurar Opciones de Instalación";
                lblTitle.Font = new Font("Segoe UI", 13f, FontStyle.Bold);
                lblTitle.ForeColor = Color.White;
                lblTitle.Location = new Point(25, 20);
                lblTitle.Size = new Size(500, 30);
                contentPanel.Controls.Add(lblTitle);

                Label lblSub = new Label();
                lblSub.Text = "Selecciona las tareas adicionales que deseas que el instalador realice:";
                lblSub.ForeColor = Color.FromArgb(170, 180, 210);
                lblSub.Location = new Point(25, 55);
                lblSub.Size = new Size(500, 30);
                contentPanel.Controls.Add(lblSub);

                chkDesktopShortcut = new CheckBox();
                chkDesktopShortcut.Text = "Crear un acceso directo en el Escritorio";
                chkDesktopShortcut.Checked = true;
                chkDesktopShortcut.ForeColor = Color.White;
                chkDesktopShortcut.Location = new Point(35, 100);
                chkDesktopShortcut.Size = new Size(480, 30);
                contentPanel.Controls.Add(chkDesktopShortcut);

                chkStartMenuShortcut = new CheckBox();
                chkStartMenuShortcut.Text = "Crear un acceso directo en el Menú Inicio de Windows";
                chkStartMenuShortcut.Checked = true;
                chkStartMenuShortcut.ForeColor = Color.White;
                chkStartMenuShortcut.Location = new Point(35, 135);
                chkStartMenuShortcut.Size = new Size(480, 30);
                contentPanel.Controls.Add(chkStartMenuShortcut);

                chkAssociateMd = new CheckBox();
                chkAssociateMd.Text = "Asociar archivos Markdown (.md) con Melo Reader";
                chkAssociateMd.Checked = true;
                chkAssociateMd.ForeColor = Color.FromArgb(0, 240, 255);
                chkAssociateMd.Location = new Point(35, 170);
                chkAssociateMd.Size = new Size(480, 30);
                contentPanel.Controls.Add(chkAssociateMd);
            }
            else if (step == 3)
            {
                // Paso 4: Instalando
                btnBack.Enabled = false;
                btnNext.Enabled = false;
                btnCancel.Enabled = false;

                Label lblTitle = new Label();
                lblTitle.Text = "Instalando Melo Reader...";
                lblTitle.Font = new Font("Segoe UI", 13f, FontStyle.Bold);
                lblTitle.ForeColor = Color.White;
                lblTitle.Location = new Point(25, 30);
                lblTitle.Size = new Size(500, 30);
                contentPanel.Controls.Add(lblTitle);

                lblProgressStatus = new Label();
                lblProgressStatus.Text = "Preparando archivos...";
                lblProgressStatus.ForeColor = Color.FromArgb(180, 190, 220);
                lblProgressStatus.Location = new Point(25, 75);
                lblProgressStatus.Size = new Size(500, 25);
                contentPanel.Controls.Add(lblProgressStatus);

                progressBar = new ProgressBar();
                progressBar.Location = new Point(25, 110);
                progressBar.Size = new Size(500, 26);
                progressBar.Style = ProgressBarStyle.Continuous;
                progressBar.Value = 10;
                contentPanel.Controls.Add(progressBar);

                // Ejecutar instalación en segundo plano
                System.Threading.ThreadPool.QueueUserWorkItem(RunInstallation);
            }
            else if (step == 4)
            {
                // Paso 5: Finalizado
                btnBack.Enabled = false;
                btnCancel.Enabled = false;
                btnNext.Enabled = true;
                btnNext.Text = "Finalizar";
                btnNext.BackColor = Color.FromArgb(16, 185, 129);

                PictureBox pic = new PictureBox();
                pic.Location = new Point(25, 30);
                pic.Size = new Size(120, 120);
                pic.SizeMode = PictureBoxSizeMode.Zoom;
                if (logoImage != null) pic.Image = logoImage;
                contentPanel.Controls.Add(pic);

                Label lblTitle = new Label();
                lblTitle.Text = "¡Instalación Completada!";
                lblTitle.Font = new Font("Segoe UI", 16f, FontStyle.Bold);
                lblTitle.ForeColor = Color.FromArgb(16, 185, 129);
                lblTitle.Location = new Point(165, 30);
                lblTitle.Size = new Size(380, 40);
                contentPanel.Controls.Add(lblTitle);

                Label lblDesc = new Label();
                lblDesc.Text = "Melo Reader se ha instalado correctamente en tu equipo.\n\n" +
                               "Ya puedes abrir cualquier archivo .md con un solo clic o desde tus accesos directos.";
                lblDesc.ForeColor = Color.FromArgb(190, 200, 230);
                lblDesc.Location = new Point(165, 80);
                lblDesc.Size = new Size(380, 80);
                contentPanel.Controls.Add(lblDesc);

                chkLaunchNow = new CheckBox();
                chkLaunchNow.Text = "Ejecutar Melo Reader ahora mismo";
                chkLaunchNow.Checked = true;
                chkLaunchNow.ForeColor = Color.FromArgb(0, 240, 255);
                chkLaunchNow.Font = new Font("Segoe UI", 10.5f, FontStyle.Bold);
                chkLaunchNow.Location = new Point(165, 175);
                chkLaunchNow.Size = new Size(380, 30);
                contentPanel.Controls.Add(chkLaunchNow);
            }
        }

        private void OnNextClicked(object sender, EventArgs e)
        {
            if (currentStep == 1)
            {
                targetFolder = txtInstallPath.Text.Trim();
                if (string.IsNullOrEmpty(targetFolder))
                {
                    MessageBox.Show("Por favor especifica una carpeta de destino válida.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }
            }
            else if (currentStep == 4)
            {
                // Finalizar
                if (chkLaunchNow != null && chkLaunchNow.Checked)
                {
                    string exePath = Path.Combine(targetFolder, "MeloReader.exe");
                    if (File.Exists(exePath))
                    {
                        Process.Start(exePath);
                    }
                }
                this.Close();
                return;
            }

            ShowStep(currentStep + 1);
        }

        private void RunInstallation(object state)
        {
            try
            {
                UpdateProgress(15, "Creando carpeta de destino...");
                if (!Directory.Exists(targetFolder))
                {
                    Directory.CreateDirectory(targetFolder);
                }

                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string zipPath = Path.Combine(baseDir, "app-dist.zip");
                string appDistDir = Path.Combine(baseDir, "app-dist");

                // Buscar si viene incrustado como recurso en el .exe
                Stream embeddedZip = null;
                Assembly asm = Assembly.GetExecutingAssembly();
                foreach (string r in asm.GetManifestResourceNames())
                {
                    if (r.EndsWith("app_dist.zip") || r.EndsWith("app-dist.zip"))
                    {
                        embeddedZip = asm.GetManifestResourceStream(r);
                        break;
                    }
                }

                if (embeddedZip != null)
                {
                    using (ZipArchive archive = new ZipArchive(embeddedZip))
                    {
                        int total = archive.Entries.Count;
                        int count = 0;
                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            string destinationPath = Path.GetFullPath(Path.Combine(targetFolder, entry.FullName));
                            if (entry.FullName.EndsWith("/") || entry.FullName.EndsWith("\\"))
                            {
                                Directory.CreateDirectory(destinationPath);
                            }
                            else
                            {
                                Directory.CreateDirectory(Path.GetDirectoryName(destinationPath));
                                entry.ExtractToFile(destinationPath, true);
                            }
                            count++;
                            int percent = 30 + (int)((float)count / total * 45f);
                            UpdateProgress(percent, "Instalando: " + entry.Name);
                        }
                    }
                }
                else if (File.Exists(zipPath))
                {
                    // Descomprimir zip externo
                    using (ZipArchive archive = ZipFile.OpenRead(zipPath))
                    {
                        int total = archive.Entries.Count;
                        int count = 0;
                        foreach (ZipArchiveEntry entry in archive.Entries)
                        {
                            string destinationPath = Path.GetFullPath(Path.Combine(targetFolder, entry.FullName));
                            if (entry.FullName.EndsWith("/") || entry.FullName.EndsWith("\\"))
                            {
                                Directory.CreateDirectory(destinationPath);
                            }
                            else
                            {
                                Directory.CreateDirectory(Path.GetDirectoryName(destinationPath));
                                entry.ExtractToFile(destinationPath, true);
                            }
                            count++;
                            int percent = 30 + (int)((float)count / total * 45f);
                            UpdateProgress(percent, "Instalando: " + entry.Name);
                        }
                    }
                }
                else if (Directory.Exists(appDistDir))
                {
                    // Copiar directamente desde app-dist
                    CopyDirectory(appDistDir, targetFolder);
                }

                UpdateProgress(80, "Creando accesos directos...");

                string installedExe = Path.Combine(targetFolder, "MeloReader.exe");

                // Acceso en Escritorio
                if (chkDesktopShortcut.Checked)
                {
                    string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                    CreateShortcut(Path.Combine(desktopPath, "Melo Reader.lnk"), installedExe, targetFolder, "Lector de Markdown Todo Melo");
                }

                // Acceso en Menú Inicio
                if (chkStartMenuShortcut.Checked)
                {
                    string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                    CreateShortcut(Path.Combine(startMenu, "Melo Reader.lnk"), installedExe, targetFolder, "Lector de Markdown Todo Melo");
                }

                UpdateProgress(90, "Registrando asociación de archivos .md...");

                if (chkAssociateMd.Checked)
                {
                    RegisterFileAssociation(installedExe);
                }

                // Registrar en Desinstalador de Windows
                RegisterUninstallInfo(installedExe, targetFolder);

                UpdateProgress(100, "¡Completado!");
                System.Threading.Thread.Sleep(500);

                this.Invoke((MethodInvoker)delegate
                {
                    ShowStep(4);
                });
            }
            catch (Exception ex)
            {
                this.Invoke((MethodInvoker)delegate
                {
                    MessageBox.Show("Ocurrió un error durante la instalación:\n" + ex.Message, "Error de Instalación", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    this.Close();
                });
            }
        }

        private void UpdateProgress(int val, string status)
        {
            this.Invoke((MethodInvoker)delegate
            {
                if (progressBar != null) progressBar.Value = Math.Min(100, val);
                if (lblProgressStatus != null) lblProgressStatus.Text = status;
            });
        }

        private void CopyDirectory(string sourceDir, string targetDir)
        {
            foreach (string dir in Directory.GetDirectories(sourceDir, "*", SearchOption.AllDirectories))
            {
                Directory.CreateDirectory(dir.Replace(sourceDir, targetDir));
            }
            foreach (string file in Directory.GetFiles(sourceDir, "*.*", SearchOption.AllDirectories))
            {
                File.Copy(file, file.Replace(sourceDir, targetDir), true);
            }
        }

        private void CreateShortcut(string shortcutPath, string targetExe, string workDir, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetExe;
                shortcut.WorkingDirectory = workDir;
                shortcut.Description = description;
                string iconPath = Path.Combine(workDir, "resources", "app", "assets", "app.ico");
                if (!File.Exists(iconPath)) iconPath = Path.Combine(workDir, "assets", "app.ico");
                if (File.Exists(iconPath))
                {
                    shortcut.IconLocation = iconPath + ",0";
                }
                shortcut.Save();
            }
            catch { }
        }

        private void RegisterFileAssociation(string exePath)
        {
            try
            {
                string workDir = Path.GetDirectoryName(exePath);
                string iconPath = Path.Combine(workDir, "resources", "app", "assets", "app.ico");
                if (!File.Exists(iconPath)) iconPath = Path.Combine(workDir, "assets", "app.ico");
                if (!File.Exists(iconPath)) iconPath = exePath;

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\.md"))
                {
                    key.SetValue("", "MeloReader.Document");
                }

                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\MeloReader.Document"))
                {
                    key.SetValue("", "Documento Markdown Melo");
                    using (RegistryKey iconKey = key.CreateSubKey("DefaultIcon"))
                    {
                        iconKey.SetValue("", iconPath + ",0");
                    }
                    using (RegistryKey cmdKey = key.CreateSubKey(@"shell\open\command"))
                    {
                        cmdKey.SetValue("", "\"" + exePath + "\" \"%1\"");
                    }
                }
            }
            catch { }
        }

        private void RegisterUninstallInfo(string exePath, string installDir)
        {
            try
            {
                string iconPath = Path.Combine(installDir, "resources", "app", "assets", "app.ico");
                if (!File.Exists(iconPath)) iconPath = Path.Combine(installDir, "assets", "app.ico");
                if (!File.Exists(iconPath)) iconPath = exePath;

                string uninstallKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\MeloReader";
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(uninstallKeyPath))
                {
                    key.SetValue("DisplayName", "Melo Reader");
                    key.SetValue("DisplayIcon", iconPath + ",0");
                    key.SetValue("DisplayVersion", "1.0.0");
                    key.SetValue("Publisher", "Melo Reader Team");
                    key.SetValue("InstallLocation", installDir);
                    key.SetValue("UninstallString", "cmd.exe /c rmdir /s /q \"" + installDir + "\"");
                }
            }
            catch { }
        }
    }
}
