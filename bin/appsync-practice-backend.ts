#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AppsyncPracticeBackendStack } from '../lib/appsync-practice-backend-stack';

const app = new cdk.App();
new AppsyncPracticeBackendStack(app, 'AppsyncPracticeBackendStack');
