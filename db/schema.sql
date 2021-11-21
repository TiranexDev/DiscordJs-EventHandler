CREATE TABLE guildconfig(
    guildId VARCHAR(200) NOT NULL PRIMARY KEY,
    cmdPrefix VARCHAR(20) DEFAULT 'ff!'
    lang VARCHAR(50) DEFAULT 'English'
)
CREATE TABLE blacklisted(
    user VARCHAR(50) NOT NULL PRIMARY KEY,
    reason VARCHAR(200) 
)