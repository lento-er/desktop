import * as React from 'react'
import { IGitHubUser } from '../../lib/databases'
import { Commit } from '../../models/commit'
import { ICompareState, CompareType } from '../../lib/app-state'
import { CommitList } from './commit-list'
import { Repository } from '../../models/repository'
import { Branch } from '../../models/branch'
import { ButtonGroup } from '../lib/button-group'
import { Button } from '../lib/button'

interface ICompareSidebarProps {
  readonly repository: Repository
  readonly gitHubUsers: Map<string, IGitHubUser>
  readonly state: ICompareState
  readonly branches: ReadonlyArray<Branch>
  readonly emoji: Map<string, string>
  readonly commitLookup: Map<string, Commit>
  readonly localCommitSHAs: ReadonlyArray<string>
  readonly dispatcher: Dispatcher
  readonly onRevertCommit: (commit: Commit) => void
  readonly onViewCommitOnGitHub: (sha: string) => void
}

export class CompareSidebar extends React.Component<ICompareSidebarProps, {}> {
  public render() {
    return (
      <div id="compare">
        {this.renderSelectList()}
        {this.renderButtonGroup()}
        <CommitList
          gitHubRepository={this.props.repository.gitHubRepository}
          commitLookup={this.props.commitLookup}
          commitSHAs={this.props.state.commitSHAs}
          selectedSHA={this.props.state.selection.sha}
          gitHubUsers={this.props.gitHubUsers}
          localCommitSHAs={this.props.localCommitSHAs}
          emoji={this.props.emoji}
          onViewCommitOnGitHub={this.props.onViewCommitOnGitHub}
          onRevertCommit={this.props.onRevertCommit}
          onCommitSelected={this.onCommitSelected}
          onScroll={this.onScroll}
        />
      </div>
    )
  }

  private renderButtonGroup() {
    return (
      <ButtonGroup>
        <Button>{`Behind (${this.props.state.behind})`}</Button>
        <Button>{`Ahead (${this.props.state.ahead})`}</Button>
      </ButtonGroup>
    )
  }

  private renderSelectList() {
    const options = new Array<JSX.Element>()
    options.push(
      <option value={-1} key={-1}>
        None
      </option>
    )

    let selectedIndex = -1
    for (const [index, branch] of this.props.branches.entries()) {
      if (
        this.props.state.branch &&
        this.props.state.branch.name === branch.name
      ) {
        selectedIndex = index
      }

      options.push(
        <option value={index} key={branch.name}>
          {branch.name}
        </option>
      )
    }

    return (
      <select value={selectedIndex.toString()} onChange={this.onBranchChanged}>
        {options}
      </select>
    )
  }

  private onBranchChanged = (event: React.FormEvent<HTMLSelectElement>) => {}
  private updateBranch(branchName: string) {
    branchName = branchName.toLowerCase()

    if (this.state.branch !== null && this.state.branch.name === branchName) {
      return
    }

    if (branchName === '') {
      this.props.dispatcher.loadCompareState(
        this.props.repository,
        null,
        CompareType.Default
      )
    } else {
      const branch = this.props.branches.find(
        branch => branch.name.toLowerCase() === branchName
      )

      if (branch == null) {
        return log.error('Cannot find branch')
      }

      this.props.dispatcher.loadCompareState(
        this.props.repository,
        branch,
        CompareType.behind
      )
    }
  }

  private onTextBoxValueChanged = (value: string) => {
    this.updateBranch(value)
    this.setState({ textInputValue: value })
  }

  private onCommitSelected = (commit: Commit) => {}

  private onScroll = (start: number, end: number) => {}
}
