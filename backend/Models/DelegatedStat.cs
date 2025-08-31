using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class DelegatedStat
    {
        [Key]
        public int Id { get; set; }
        public string Rir { get; set; }
        public string Country { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }
        public string Size { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public string Entity { get; set; }
    }
}