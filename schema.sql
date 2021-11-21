CREATE TABLE guildconfig {
    guildId varchar(100) NOT NULL PRIMARY KEY,
    cmdPrefix varchar(20) DEFAULT 'u!',
    lang varchar(50) DEFAULT 'English'
}
CREATE TABLE blacklisted(
    user VARCHAR(50) NOT NULL PRIMARY KEY,
    reason VARCHAR(200) 
)
