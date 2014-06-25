#!/usr/bin/env python
#
# Copyright 2014 Red Beacon, Inc. - All Rights Reserved
#
# This is the Fabric file for pushing the Techshed website.
#
# Author: Billy McCarthy

from fabric.api import *  # Recommended by Fabric # NOQA
from fabric.colors import *  # NOQA

env.user = 'produser'
BASEDIR = '~/src/techshed.co'
env.roledefs = {
    'dev': ['adfe3', 'adfe4'],
    'prod': ['apfe4', 'apfe5']
}


# ---------------------------------------------------------------------------
# MAIN COMMANDS


@task
@roles('dev')
def push_dev():
    with cd(BASEDIR):
        git_checkout_and_pull(branch="master")
        clean()
        build()
# ---------------------------------------------------------------------------
# HELPER COMMANDS


def build():
    run('npm install')
    run('bower install')
    run('grunt build')


def clean():
    run('rm -rf dist')
    run('rm -rf node_modules')


def git_checkout_and_pull(branch, run_local=False):
    """
    Runs git checkout and pull --rebase on the given branch.
    """
    if run_local:
        local('find -name "*.pyc" -delete')
        local('git fetch')
        local('git checkout %s' % branch)
        local('git pull --rebase origin %s' % branch)
    else:
        run('find -name "*.pyc" -delete')
        run('git fetch')
        run('git checkout %s' % branch)
        run('git pull --rebase origin %s' % branch)
