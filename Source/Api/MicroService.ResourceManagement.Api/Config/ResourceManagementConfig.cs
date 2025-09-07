namespace MicroService.ResourceManagement.Api.Config
{
    public class ResourceManagementConfig
    {
        public string NroStatusUrl { get; set; } = string.Empty;
        public bool UseInMemoryData { get; set; } = true;
        public string DataFolderName { get; set; } = string.Empty;
    }
}