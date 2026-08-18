namespace taskAPI.Dto
{
    public class UserListItemResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTimeOffset? LastLogInAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class BatchUserActionRequest
    {
        public List<Guid> UserIds { get; set; } = new();
    }
}