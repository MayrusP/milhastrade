#!/bin/bash
# Script para conectar no EC2

# Ajustar permissões da chave
chmod 400 milhastrade-key.pem

# Conectar
ssh -i milhastrade-key.pem ubuntu@3.234.253.51
