using System;
using System.ComponentModel.DataAnnotations;

namespace MicroService.ResourceManagement.Api.Models
{
    public class DelegatedStat
    {
        public int Id { get; set; }
        public string Rir { get; set; }
        public string Country { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }
        public string Size { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public string Entity { get; set; }
        public DateTime CreatedDate { get; set; }
        public string InUseStatus { get; set; }
    }
}