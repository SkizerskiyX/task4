FROM mcr.microsoft.com/dotnet/sdk:10.0 AS builder
WORKDIR /src
COPY ["taskAPI/taskAPI.csproj", "taskAPI/"]
COPY ["Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["Entities/Entities.csproj", "Entities/"]
RUN dotnet restore "./taskAPI/taskAPI.csproj"
COPY . .
RUN dotnet publish "taskAPI/taskAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/publish .

EXPOSE 8080 8081
ENTRYPOINT ["dotnet", "taskAPI.dll"]
