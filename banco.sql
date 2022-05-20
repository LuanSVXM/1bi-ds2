drop table Users;
drop table Grupo;
drop table Permissaos;


create table  Users (

    id serial,
    username varchar(20),
    senha TEXT,
    superUser varchar(1),
    email TEXT,
    primary key (id)

)


create table Grupo (
    id serial,
    owner int(20),
    nome varchar(20),
    primary key (id),
    FOREIGN KEY (owner) REFERENCES Users(id)
)


create table Permissaos (

    id serial,
    id_grupo int(20),
    id_user int(20),
    permissao varchar(1) // l = leitura  r = escrita,
    primary key (id),
    FOREIGN KEY (id_user) REFERENCES Users(id)
    FOREIGN KEY (id_grupo) REFERENCES Grupo(id)

)
